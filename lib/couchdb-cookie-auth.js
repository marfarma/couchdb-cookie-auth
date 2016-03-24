/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

(function () {

  var config = require('../lib/couchdb-cookie-auth-config.js'),
    base64url = require('sixtyfour'),
    Promise = require("bluebird"),
    cookie = require('cookie'),
    sha1 = require('../external/sha1'),
    debug = require('debug')('cookieauth'),
    KeepAliveAgent = require('agentkeepalive'),
    SslKeepAliveAgent = require('agentkeepalive').HttpsAgent,
    authDb;


  // split a buffer of binary data by a binary delimiter
  function splitBuffer(buf, delimiter) {
    var arr = [],
      p = 0;

    for (var i = 0, l = buf.length; i < l; i++) {
      if (buf[i] !== delimiter) {
        continue;
      }
      if (i === 0) {
        p = 1;
        continue; // skip if it's at the start of buffer
      }
      arr.push(buf.slice(p, i));
      p = i + 1;
    }

    // add final part
    if (p < l) {
      arr.push(buf.slice(p, l));
    }

    return arr;
  }

  // returns credentials url string
  function credentials() { //jshint ignore:line
    if (config.get('dbUser').length > 0 && config.get('dbPass').length > 0) {
      return config.get('dbUser') + ":" + config.get('dbPass') + "@";
    } else {
      return "";
    }
  }

  // returns url for couchdb server from module config settings
  function url() {
    var returnVal = {},
      user, password;

    // return empty string if user credentials not found
    if (config.get('dbUser').length > 0 && config.get('dbPass').length > 0) {
      user = config.get('dbUser');
      password = config.get('dbPass');
    } else {
      return "";
    }
    // debugger;
    if (config.get('dbSsl')) {
      KeepAliveAgent = SslKeepAliveAgent;
    }

    var myagent = new KeepAliveAgent({
      maxSockets: 256,
      maxFreeSockets: 256,
      keepAliveTimeout: 60 * 1000,
      maxKeepAliveRequests: 0,
      maxKeepAliveTime: 240000
    });

    returnVal.requestDefaults = {
      "agent": myagent,
      'auth': {
        'user': user,
        'pass': password,
        'sendImmediately': true
      }
    };
//    debugger;
    returnVal.url = "http" + (config.get('dbSsl') ? "s" : "") +
      "://" + config.get('dbHost') +
//      "://" + credentials() + config.get('dbHost') +
      ":" + config.get('dbPort');

    if (config.get('env') === 'development' ||
      config.get('env') === 'test') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
      returnVal.requestDefaults.rejectUnauthorized = false;
    }

    debug('url object: ', returnVal.url);
    //debug(returnVal.requestDefaults);
    return returnVal;
  }
  var nanoOpts = url();
  //  debug('nanoOpts: ', nanoOpts);
  var nano = require('nano-blue')({
    'url': nanoOpts.url,
    'requestDefaults': nanoOpts.requestDefaults
  });

  // Get the value of the couchdb config setting for section & key
  // return default if no value found
  function getConfig(section, key, default_value) {
    // i.e. _config/couch_httpd_auth/allow_persistent_cookies
    // i.e. _config/admins
    debug('in getConfig, args:', section, key, default_value);
    var path;

    if (key === undefined) {
      path = section;
    } else {
      path = section + '/' + key;
    }

    //    debug('nano: ', nano);
    debug('path: ', path);
//    debugger; //jshint ignore:line
    return nano.request({
        method: 'GET',
        path: '_config/' + path
      })
      .spread(function (body, headers) { // jshint ignore:line
        debug('_config/' + section + '/' + key + ' = ' + body);
        return Promise.resolve(body);
      })
      .catch(function (err) {
        debug(err);
        if (err.cause.statusCode === 404) {
          return Promise.resolve(default_value);
        } else {
          return Promise.reject(err);
        }
      });

  }

  // returns a hex string for current unix time
  function getTimeStamp() {
    return Math.floor(Date.now() / 1000).toString(16).toUpperCase();
  }

  // takes a a hex string for past unix time
  // returns the difference between it and now, in seconds
  function secondsAgo(TimeStamp) {
    var now = Math.floor(Date.now() / 1000);
    var then = parseInt(TimeStamp, 16);

    if (now < then) {
      throw new Error("TimeStamp can't be greater than now.");
    }
    return now - then;
  }

  // update config admin credentials, reset server connection
  var setUserPass = Promise.method(function setUserPass(user, pass) {
    config.set('dbUser', user);
    config.set('dbPass', pass);
    var u = url();

    nano = require('nano-blue')(u);
    return Promise.resolve(nano);
  });

  // get value of setting _config/couch_httpd_auth/authentication_db
  var getAuthDb = Promise.method(function () {
    return getConfig("couch_httpd_auth", "authentication_db", undefined)
      .then(function (result) {
        if (result === undefined) {
          Promise.reject(new Error('_config/couch_httpd_auth/authentication_db required'));
        }
        authDb = result;
        return result;
      })
      .catch(function (err) {
        return Promise.reject(err);
      });

  });

  // respecting the value of the authentication database
  // config setting, return the property 'salt' for user
  // if user is not found, check if user is a server admin
  // server admins don't need user docs for authentication
  //
  // GET /_config/admins
  // returns:
  // {
  //     "admin": "-hashed-6d3c30241ba0aaa4e16c6ea99224f915687ed8cd,7f4a3e05e0cbc6f48a0035e3508eef90",
  //     "architect": "-pbkdf2-43ecbd256a70a3a2f7de40d2374b6c3002918834,921a12f74df0c1052b3e562a23cd227f,10000"
  // }
  //
  // whether hashed or encrypted (pbkdf2), the salt is the second comma
  // separated element
  //
  var getUserSalt = Promise.method(function (user) {
    return getAuthDb()
      .then(function (authDb) {
        var db = nano.use(authDb);
        var id = 'org.couchdb.user:' + user;

        return db.get(id, {
            revs_info: true
          })
          .spread(function (user, header) { // jshint ignore:line
            if (!user.salt) {
              debug('salt not defined for user: ' + user.name);
              return Promise.reject({
                cause: {
                  statusCode: 404
                },
                message: 'salt not found for user: '+ user.name
              });
            }
            return user.salt;
          })
          .then(null, function (err) { // jshint ignore:line
            debug(err);
            if (err.cause && err.cause.statusCode === 404) {
              return getConfig("admins")
                .then(function (result) {
                  if (result.hasOwnProperty(user)) {
                    var parts = result[user].split(',');
                    return parts[1];
                  } else {
                    return Promise.reject(new Error('user not found, authentication not possible'));
                  }
                })
                .catch(function (err) {
                  return Promise.reject(err);
                });
            }
            console.log(err);
            return Promise.reject(new Error('error access database, authentication not possible'));
          });
      })
      .then(null, function (err) {
        return Promise.reject(err);
      });
  });

  // get value of setting _config/couch_httpd_auth/secret
  var getServerSecret = Promise.method(function () {
    debug('in getServerSecret');
    return getConfig("couch_httpd_auth", "secret", undefined)
      .then(function (result) {
        debug('getConfig returned: ', result);
        if (result === undefined) {
          return Promise.reject(new Error('_config/couch_httpd_auth/secret required for cookie authentication'));
        }
        return result;
      });
  });

  // return the cookie timeout value
  // if persistant cookies are enabled, otherwise return zero
  var maxAge = Promise.method(function () {
    return getConfig("couch_httpd_auth", "allow_persistent_cookies", "false")
      .then(function (persistent) {
        if (persistent === 'true') {
          return getConfig("couch_httpd_auth", "timeout", "600")
            .then(function (result) {
              return parseInt(result, 10);
            });
        } else {
          return 0;
        }
      })
      .then(null, function (err) {
        throw err;
      });
  });

  // returns the concatenation of server secret and user salt
  // the "full secret" used to encrypt the cookie hash
  function fullSecret(user) {
    debug('fullSecret user: ', user);
    if (user === undefined || user === 'undefined') {
      return Promise.reject(new TypeError('user name required'));
    }
    debug('fullSecret user: ', user);
    var join = Promise.join;

    return join(getServerSecret(), getUserSalt(user), function (secret, salt) {
      debug('serverSecret: ' + secret + ' user salt: ' + salt);
        return Promise.resolve(secret + salt);
      })
      .catch(function (err) {
        //console.log(err);
        return Promise.reject(err);
      });

  }


  function cookieValue(secret, user, timestamp) {
    var SessionData = user + ":" + timestamp;
    var Hash;

    // buffer used as decoding as string corrupts data
    Hash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(secret, SessionData));
    var plain = Buffer.concat([new Buffer(SessionData), new Buffer(":"), Hash]);
    var result = base64url.urlencode(plain);
    return result.toString('binary');
  }

  // returns (builds) current cookie value for authenticated user
  // returns a promise.  If error return empty string to clear any existing cookie
  function getCookieValue(user) {
    return fullSecret(user)
      .then(function (FullSecret) {
        var timeStamp = getTimeStamp();
        return Promise.resolve(cookieValue(FullSecret, user, timeStamp));
      })
      .catch(function (err) { // jshint ignore:line
        Promise.resolve('');
      });
  }

  function getCookieOptions() {
    var options = {
      path: '/',
      httpOnly: true
    };

    return maxAge()
      .then(function (maxSeconds) {
        var ssl = config.get('dbSsl');
        var noHttps = config.get('noHttps');

        if (maxSeconds > 0) {
          options.maxAge = maxSeconds;
        }

        if (noHttps === false && ssl === true) {
          options.secure = true;
        }

        options.domain = config.get('domain');

        return Promise.resolve(options);
      });

  }

  function parseCookie(cookieVal) {
    var result = {},
      tail, s, i;
    var decoded = base64url.urldecodeAsBuffer(cookieVal);


    // check format - split buffer on byte code for ':', 0x3A
    var parts = splitBuffer(decoded, 0x3A);

    if (parts.length < 3) {
      throw new Error('Malformed AuthSession cookie. Please clear your cookies.');
    }

    // merge elements >= 2 restoring embeded ':' chars
    if (parts.length > 3) {
      tail = parts.slice(3, parts.length);
      s = new Buffer(":");

      for (i = 0; i < tail.length; i++) {
        parts[2] = Buffer.concat([parts[2], s, tail[i]]);
      }
    }

    result.user = parts[0].toString('binary');
    result.timestamp = parts[1].toString('binary');
    result.hash = parts[2];
    return result;
  }

  /**
   * constantEquals(x, y)
   *
   * Compare two strings, x and y with a constant time
   * algorithm to prevent attacks based on timing statistics.
   */
  var constantEquals = function constantEquals(x, y) {
    var result = true,
      length = (x.length > y.length) ? x.length : y.length,
      i;

    for (i = 0; i < length; i = i + 1) {
      if (x.charCodeAt(i) !== y.charCodeAt(i)) {
        result = false;
      }
    }
    return result;
  };

  var validCookie = Promise.method(function (cookieVal) {
    debug('in validCookie');
    //    debugger;
    var cObj = parseCookie(cookieVal);
    debug('parsed cookie: ', cObj);
    var SessionData = cObj.user + ":" + cObj.timestamp;
    debug('SessionData: ', SessionData);

    return Promise.join(
        getConfig("couch_httpd_auth", "timeout", "600"),
        fullSecret(cObj.user),
        function (timeout, FullSecret) {
          debug('timeout, FullSecret: ', timeout, FullSecret);

          var elapsed = secondsAgo(cObj.timestamp);
          debug('elapsed: ', elapsed);

          if ((timeout > 0) && (elapsed <= timeout)) {
            debug('cookie time is valid.');

            var expectedHash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(FullSecret, SessionData));
            debug('expectedHash: ', expectedHash.toString('hex'));
            debug('submitted cookie hash: ', cObj.hash.toString('hex'));

            return constantEquals(cObj.hash.toString('hex'), expectedHash.toString('hex'));
          }
          debug('cookie time invalid: ');
          return Promise.resolve(false);
        })
      .catch(function (err) { //jshint ignore:line
        debug('some other error: ', err);
        //console.log(err);
        return Promise.resolve(false);
      });
  });

  var newCookie = Promise.method(function (user) {
    var join = Promise.join;
    debug('in newCookie');

    return join(getCookieOptions(), getCookieValue(user), function (options, content) {
      debug('got cookie options and value');
      if (content === undefined) {
        content = '';
      }
      return cookie.serialize('AuthSession', content, options);
    });
  });

  function refreshedCookie(cookieStr, original) {
    return getConfig("couch_httpd_auth", "timeout", "600")
      .then(function (result) {
        var timeout = parseInt(result, 10);
        var cObj = parseCookie(cookieStr);
        var elapsed = secondsAgo(cObj.timestamp);
        var remaining = ((timeout - elapsed) / timeout).toPrecision(2); // force float result

        if (remaining < 0.9) {
          return newCookie(cObj.user); // refresh timestamp
        } else {
          return original;
        }
      });
  }

  // returns serialized cookie (with options) suitable Set-Cookie assignment
  function makeCookie(user, cookieStr) {
    debug('top of makeCookie');
    if (cookieStr !== undefined) {
      debug('we have a cookie');
      var cookies = cookie.parse(cookieStr);

      if (cookies.AuthSession && validCookie(cookies.AuthSession)) {
        debug('cookie is valid call refresh');
        return refreshedCookie(cookies.AuthSession, cookieStr);
      } else {
        debug('clear invalid cookie');
        // clear cookie if provided but invalid
        return getCookieOptions().then(function (options) {
          return cookie.serialize('AuthSession', '', options);
        });
      }
    } else {
      debug('no cookie param, call newCookie');
      return newCookie(user);
    }
  }

  module.exports = {
    // private methods exposed for unit testing
    getConfig: getConfig,
    getAuthDb: getAuthDb,
    maxAge: maxAge,
    getServerSecret: getServerSecret,
    getTimeStamp: getTimeStamp,
    getUserSalt: getUserSalt,
    setUserPass: setUserPass,
    getCookieOptions: getCookieOptions,
    fullSecret: fullSecret,
    splitBuffer: splitBuffer,
    constantEquals: constantEquals,
    newCookie: newCookie,
    refreshedCookie: refreshedCookie,
    parseCookie: parseCookie,
    getCookieValue: getCookieValue, // takes user and returns value
    cookieValue: cookieValue, // takes given parameters and returns value


    // public interface
    validCookie: validCookie,
    config: config,
    server: nano,
    makeCookie: makeCookie // final header assignable cookie string
  };

}());
