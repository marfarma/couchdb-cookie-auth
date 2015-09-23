/*jslint node: true, unparam: true, vars: true, es5: true, white: true, nomen: true*/
/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

(function() {

  var config = require('./config.js'),
    base64url = require('sixtyfour'),
    Promise = require("bluebird"),
    cookie = require('cookie'),
    sha1 = require('../lib/sha1'),
    authDb;


  // polyfill for Date.now
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  // split a buffer of binary data by a binary delimiter
  function splitBuffer(buf, delimiter) {
    var arr = [], p = 0;

    for (var i = 0, l = buf.length; i < l; i++) {
      if (buf[i] !== delimiter) {continue;}
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
  function credentials() {
    if (config.get('dbUser').length > 0 && config.get('dbPass').length > 0) {
      return config.get('dbUser') + ":" + config.get('dbPass') + "@";
    } else {
      return "";
    }
  }

  // returns url for couchdb server from module config settings
  function url() {
    var returnVal = "http" + (config.get('dbSsl') ? "s" : "") +
      "://" + credentials() + config.get('dbHost') +
      ":" + config.get('dbPort');
    return returnVal;
  }

  var nano = require('nano-blue')({
    'url': url()
  });

  // Get the value of the couchdb config setting for section & key
  // return default if no value found
  function getConfig(section, key, default_value) {
    // i.e. _config/couch_httpd_auth/allow_persistent_cookies
    // i.e. _config/admins

    var tail;

    if (key === undefined) {
      tail = section;
    } else {
      tail = section + '/' + key;
    }

    return nano.request({
      method: 'GET',
      path: '_config/' + tail
    })
    .spread(function(body, headers) { // jshint ignore:line
      //console.log('_config/' + section + '/' + key + ' = ' + body);
      return Promise.resolve(body);
    })
    .catch(function(err) {
      //console.log(err);
      if (err.cause.statusCode === 404) {
        return Promise.resolve(default_value);
      } else {
        return Promise.reject(err);
      }
    });

  }

  // returns a hex string for current unix time
  function getTimeStamp() {
    return Math.floor(Date.now() / 1000).toString(16);
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

    nano = require('nano-blue')({
      'url': u
    });
    return Promise.resolve(nano);
  });

  // get value of setting _config/couch_httpd_auth/authentication_db
  var getAuthDb = Promise.method(function() {
    return getConfig("couch_httpd_auth", "authentication_db", undefined)
      .then(function(result) {
        if (result === undefined) {
          Promise.reject(new Error('_config/couch_httpd_auth/authentication_db required'));
        }
        authDb = result;
        return result;
      })
    .catch(function(err){
      console.log(err);
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
  var getUserSalt = Promise.method(function(user) {
    return getAuthDb()
      .then(function(authDb) {
        var db = nano.use(authDb);
        var id = 'org.couchdb.user:' + user;

        return db.get(id, {
          revs_info: true
        })
          .spread(function(user, header) { // jshint ignore:line
            return user.salt;
          })
          .then(null, function(err) { // jshint ignore:line
            return getConfig("admins")
            .then(function(result) {
              if(result.hasOwnProperty(user)) {
                var parts = result[user].split(',');
                return parts[1];
              } else {
                throw new Error('user not found, authentication not possible');
              }
            });

          });
      })
      .then(null, function(err) {
        return Promise.reject(err);
      });
  });

  // get value of setting _config/couch_httpd_auth/secret
  var getServerSecret = Promise.method(function() {
    return getConfig("couch_httpd_auth", "secret", undefined)
    .then(function(result) {
      if (result === undefined) {
        throw new Error('_config/couch_httpd_auth/secret required for cookie authentication');
      }
      return result;
    });
  });

  // return the cookie timeout value
  // if persistant cookies are enabled, otherwise return zero
  var maxAge = Promise.method(function() {
    return getConfig("couch_httpd_auth", "allow_persistent_cookies", "false")
    .then(function(persistent) {
      if (persistent === 'true') {
        return getConfig("couch_httpd_auth", "timeout", "600")
        .then(function(result) {
          return parseInt(result, 10);
        });
      } else {
        return 0;
      }
    })
    .then(null, function(err) {
      throw err;
    });
  });

  // returns the concatenation of server secret and user salt
  // the "full secret" used to encrypt the cookie hash
  function fullSecret(user) {
    if (user === undefined || user === 'undefined') {
      //console.log()
      throw new TypeError('user name required');
    }
    var join = Promise.join;

    return join(getServerSecret(), getUserSalt(user), function(secret, salt) {
      return Promise.resolve(secret + salt);
    })
    .catch(function(err) {
      console.log(err);
      return Promise.reject(err);
    });

  }


  function cookieValue(secret, user, timestamp) {
    var SessionData = user + ":" + timestamp;
    var Hash;

    // buffer used as decoding as string corrupts data
    Hash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(secret, SessionData));
    var plain = Buffer.concat([new Buffer(SessionData),new Buffer(":"),Hash]);
    var result = base64url.urlencode(new Buffer(plain));
    return result.toString('binary');

  }

  // returns (builds) current cookie value for authenticated user
  // returns a promise.  If error return empty string to clear any existing cookie
  function getCookieValue(user) {
    return fullSecret(user)
    .then(function(FullSecret) {
      return Promise.resolve(cookieValue(FullSecret, user, getTimeStamp()));
    })
    .catch(function(err) { // jshint ignore:line
      Promise.resolve('');
    });
  }

  function getCookieOptions() {
    var options = {
      path: '/',
      httpOnly: true
    };

    return maxAge()
    .then(function(maxSeconds) {
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
    var result = {}, tail, s, i;
    cookieVal = base64url.urldecodeAsBuffer(cookieVal);

    //console.log(cookieVal.toString());
    // check format - split buffer on byte code for ':', 0x3A
    var parts = splitBuffer(cookieVal, 0x3A);

    if (parts.length < 3) {
      throw new Error('Malformed AuthSession cookie. Please clear your cookies.');
    }

    // merge elements >= 2 restoring embeded ':' chars
    if (parts.length > 3) {
      tail = parts.slice(3, parts.length-1);
      s = new Buffer(":");

      for (i = 0; i < tail.length; i++) {
        parts[2] = Buffer.concat([parts[2], s, tail[i]]);
      }
      //console.log(parts[2].toString());
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

  var validCookie = Promise.method(function(cookieVal) {
    var cObj = parseCookie(cookieVal);
    var SessionData = cObj.user + ":" + cObj.timestamp;

    return Promise.join(
      getConfig("couch_httpd_auth", "timeout", "600"),
      fullSecret(cObj.user),
      function(timeout, FullSecret){

        var elapsed = secondsAgo(cObj.timestamp);

        if ((timeout > 0) && (elapsed <= timeout)) {
          var expectedHash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(FullSecret, SessionData));
          return constantEquals(cObj.hash.toString('hex'), expectedHash.toString('hex'));
        }
        return Promise.resolve(false);
      })
    .catch(function(err) { //jshint ignore:line
      console.log(err);
      return Promise.resolve(false);
    });
  });

  function newCookie(user) {
    var join = Promise.join;

    return join(getCookieOptions(), getCookieValue(user), function(options, content) {
      return cookie.serialize('AuthSession', content, options);
    });
  }

  function refreshedCookie(cookieStr) {
    return getConfig("couch_httpd_auth", "timeout", "600")
    .then(function(result) {
      var timeout = parseInt(result, 10);
      var cObj = parseCookie(cookieStr);
      var elapsed = secondsAgo(cObj.timetamp);
      var remaining = (elapsed /timeout).toPrecision(1); // force float result

      if ( remaining < 0.9) {
        return newCookie(cObj.user); // refresh timestamp
      } else {
        return cookieStr;
      }
    });
  }

  // returns serialized cookie (with options) suitable Set-Cookie assignment, i.e.:
  function makeCookie(user, cookieStr) {
    if (cookieStr !== undefined) {
      var cookies = cookie.parse(cookieStr);

      if (cookies.AuthSession && validCookie(cookies.AuthSession)) {
        return refreshedCookie(cookies.AuthSession);
      } else {
        // clear cookie if provided but invalid
        return getCookieOptions().then(function(options) {
          return cookie.serialize('AuthSession', '', options);
        });
      }
    } else {
      return newCookie(user);
    }
  }

  module.exports = {
    config: config,
    server: nano,
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
    validCookie: validCookie,
    makeCookie: makeCookie,           // final header assignable cookie string
    newCookie: newCookie,
    refreshedCookie: refreshedCookie,
    parseCookie: parseCookie,
    getCookieValue: getCookieValue,   // takes user and returns value
    cookieValue: cookieValue          // takes given parameters and returns value

  };

}());
