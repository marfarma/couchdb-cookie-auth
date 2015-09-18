/*jslint node: true, unparam: true, vars: true, white: true*/
/*jshint curly: true, eqeqeq: true, immed: true, newcap: true, noarg: true, undef: true, unused: true, latedef: true, boss: true, eqnull: true, laxcomma: true, sub: true, node: true, mocha: true*/

/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

(function () {

    var config = require('./config.js'),
        base64url = require('base64url'),
        Promise = require("bluebird"),
        cookie = require('cookie'),
        CryptoJS = require('crypto-js'),
        serverSecret,
        authDb;

    // polyfill for Date.now
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }
    
    // returns credentials url string
    function credentials() {
      if (config.get('dbUser').length > 0 && config.get('dbPass').length > 0) {
        return config.get('dbUser') + ":" + config.get('dbPass') + "@";
      }
      else { return ""; }
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

        return nano.request({
            method : 'GET',
            path: '_config/' + section + '/' + key
        })
        /* jshint -W098*/
        .spread(function(body, headers) { /*jshint +W089 */
            //console.log('_config/' + section + '/' + key + ' = ' + body);
            return Promise.resolve(body);
        })
        .then(null, function(err) {
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
        var then = parseInt(TimeStamp,16);
        if (now < then) {
            throw new Error("TimeStamp can't be greater than now.");
        }
        return now - then;
    }

    // update config admin credentials, reset server connection
    var setUserPass = Promise.method(function setUserPass(user, pass) {
      config.set('dbUser', user);
      config.set('dbPass', pass);

      nano = require('nano-blue')({
            'url': url()
      });
    });

    // get value of setting _config/couch_httpd_auth/authentication_db
    var getAuthDb = Promise.method(function () {
        return getConfig("couch_httpd_auth", "authentication_db", undefined)
        .then(function(result) {
            if (result === undefined) {
                Promise.reject(new Error('_config/couch_httpd_auth/authentication_db required'));
            }
            authDb = result;
            return result;
        });

    });

    // respect the value of the authentication database
    // config setting, return the property 'salt' for user
    var getUserSalt = Promise.method(function (user) {
        return getAuthDb()
        .then(function(authDb) {
            //console.log('should be right after get authentication database: ' + authDb);
              var db = nano.use(authDb);
              id = 'org.couchdb.user:'+user;

              return db.get(id, { revs_info: true })
              .spread(function(user, header) {
                  return user.salt;
              })
              .then(null, function(err) {
                  return Promise.reject(err);
              });
        })
        .then(null, function(err) {
            return Promise.reject(err);
        });
    });

    // get value of setting _config/couch_httpd_auth/secret and cache result
    // for future use
    var getServerSecret = Promise.method(function() {
        if (serverSecret) {
            return serverSecret;
        }
        return getConfig("couch_httpd_auth", "secret", undefined)
            .then(function(result) {
            if (result === undefined) {
                throw new Error('_config/couch_httpd_auth/secret required for cookie authentication');
            }
            serverSecret = result;
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
        .then(null, function (err) {
            throw err;
        });
    });

    // returns the concatenation of server secret and user salt
    // the "full secret" used to encrypt the cookie hash
    function fullSecret(user) {
        return getServerSecret()
        .then(function(secret) {
            return secret;
        })
        .then(function(secret) {
            return getUserSalt(user)
                .then(function(salt) {
                return secret + salt;
            });
        });
    }

    // returns (builds) current cookie value for authenticated user
    // returns a promise
    function getCookieValue(user) {
        return fullSecret(user)
        .then(function(FullSecret) {
            var SessionData = user + ":" + getTimeStamp();
            var Hash = CryptoJS.HmacSHA1(SessionData, FullSecret).toString(CryptoJS.enc.Hex);
            return base64url.encode(SessionData + ':' + Hash);
        });
    }

    function getCookieOptions() {
        var options = {
            path: '/',
            httpOnly: true
        };

        var maxSeconds = maxAge();
        if (maxSeconds > 0) {
            options.maxAge = maxSeconds;
        }

        var ssl = config.get('dbSsl');
        var noHttps = config.get('noHttps');

        if (noHttps === false && ssl === true) {
            options.secure = true;
        }

        options.domain = config.get('domain');

        return options;
    }

    // returns serialized cookie (with options) suitable Set-Cookie assignment, i.e.:
    function makeCookie(user) {
        var options = getCookieOptions();
        getCookieValue(user)
        .then(function(content) {
            return cookie.serialize('AuthSession', content, options);
        });
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

      for (i=0; i<length; i=i+1) {
        if (x.charCodeAt(i) !== y.charCodeAt(i)) {
          result = false;
        }
      }
      return result;
    };

    var validCookie = Promise.method(function(cookie) {
        // base64url.decode(b64UrlEncodedString, [encoding])
        // Encoding defaults to 'utf8'
        cookie = base64url.decode(cookie);

        // check format
        var parts = cookie.split(':');
        if (parts.length !== 3) {
            throw new Error('Malformed AuthSession cookie. Please clear your cookies.');
        }

        var user = parts[0], timestamp = parts[1], hash = parts[2];

        return getConfig("couch_httpd_auth", "timeout", "600")
        .then(function(timeout) {
            if ( (timeout > 0) && (secondsAgo(timestamp) >= timeout) ) {
                // expired
                return false;
            }
            return true;
        })
        .then(function(valid) {
            if (valid === true) {
                // if not expired, compare hashes
                return fullSecret(user)
                .then(function(FullSecret) {
                    var SessionData = user + ":" + timestamp;
                    var expectedHash = CryptoJS.HmacSHA1(SessionData, FullSecret).toString(CryptoJS.enc.Hex);
                    return constantEquals(hash, expectedHash);
                });
            }
            return false;
        });

    });

    module.exports = {
        config : config,
        server : nano,
        getConfig: getConfig,
        getAuthDb: getAuthDb,
        maxAge: maxAge,
        getServerSecret: getServerSecret,

        validCookie: validCookie,
        makeCookie: makeCookie,
        getCookieOptions: getCookieOptions,
        getCookieValue: getCookieValue,
        fullSecret: fullSecret,

        getUserSalt: getUserSalt,
        setUserPass: setUserPass
    };

  }());
