/*jslint node: true, unparam: true, vars: true, es5: true, white: true, nomen: true*/
/*global describe, xit, it, before, after, beforeEach, afterEach */
'use strict';

var cca = require('../lib/couchdb-cookie-auth.js'),
  chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  should = chai.should(), // jshint ignore:line
  test_helper = require('./spec_helper'),
  Promise = require("bluebird"),
  nock = require('nock'),
  nano = cca.server,
  sha1 = require('../lib/sha1'),
  base64url = require('sixtyfour'),
  tk = require('timekeeper'),
  user = 'patricia';

  chai.use(chaiAsPromised);
  chai.use(require('chai-string'));

// known good values
var target = {
    Cookie: "YWRtaW46NTYwMkNCOUU6urYrI4jgqahrY1EygJ_y-HzU098",
    User: "admin",
    TimeStr: "5602CB9E",
    Secret: "92de07df7e7a3fe14808cef90a7cc0d91",
    UserSalt: "39cb5a639e5b848228bb49fd72da18e8",
    Timeout: 600
};
var testUser = {
  name: user,
  password: 'secret',
  roles: [],
  type: 'user'
};

describe('SSL', function(){
    xit('TODO: should repeat all tests with ssl true', function() {
    });
});
describe('Cookie', function() {
  describe('validCookie', function() {
    var admin = {}, regular = {}, scope = nock('http://104.236.41.70:80');

//    before(function(){
//        scope.done();
//        nock.cleanAll();
//        scope = nock('http://104.236.41.70:80')
//          .get('/_config/couch_httpd_auth/authentication_db')
//          .reply(200, "_users")
//          .get('/_users/org.couchdb.user%3Apatricia')
//          .reply(404, {
//            "error": "not_found",
//            "reason": "deleted"
//          })
//          .put('/_users/org.couchdb.user%3Apatricia', {
//            "name": "patricia",
//            "password": "secret",
//            "roles": [],
//            "type": "user"
//          })
//          .reply(201, {
//            "ok": true,
//            "id": "org.couchdb.user:patricia",
//            "rev": "1-a6294859a9f9a9982e2915fb18ee7d83"
//          });
//
//        return test_helper.createUser(dummy);
//    });

//    after(function(){
//        scope.done();
//        nock.cleanAll();
//        scope = nock('http://104.236.41.70:80')
//          .get('/_config/couch_httpd_auth/authentication_db')
//          .reply(200, "_users")
//          .get('/_users/org.couchdb.user%3Amary')
//          .reply(200, {
//            "_id": "org.couchdb.user:mary",
//            "_rev": "1-a6294859a9f9a9982e2915fb18ee7d83",
//            "password_scheme": "pbkdf2",
//            "iterations": 10,
//            "name": "mary",
//            "roles": [],
//            "type": "user",
//            "derived_key": "dc1b08a2ec5226106fbc6dad3fc0e226ac8c2b4f",
//            "salt": "fb275752e32d2b6ebbba5f687a188697"
//          })
//          .get('/_config/couch_httpd_auth/authentication_db')
//          .reply(200, "_users")
//          .delete('/_users/org.couchdb.user%3Amary')
//          .query({
//            "rev": "1-a6294859a9f9a9982e2915fb18ee7d83"
//          })
//          .reply(200);
//
//        return test_helper.deleteUser(user)
//        .then(function(result){
//          scope.done();
//          return Promise.resolve(result);
//        })
//        .catch(function(err){
//          console.log('there was an error');
//          scope.done();
//          return Promise.reject(err);
//        });
//    });
    beforeEach(function(){

//      admin = cca.parseCookie('YWRtaW46NTYwMDg1Qzk6UhhTpdKHwyYCNjrpNt9Dp8LrOlI');
//      admin.cookie = 'YWRtaW46NTVGRDZDRUE6vtRbQoEXD9O6R4MYd8ro2o6Rzrc';
//      admin.seconds = parseInt(admin.timestamp, 16)*1000;
//      admin.time = new Date(admin.seconds);
      //console.log('admin.hash: ' + admin.hash.toString());
      //console.log('filler');

      regular = cca.parseCookie('bWFyeTo1NUZGODY4QzqQZ7Kb7tzKoY8osGuguJ2MBUqT4g');
      regular.cookie = 'bWFyeTo1NUZGODY4QzqQZ7Kb7tzKoY8osGuguJ2MBUqT4g';
      regular.seconds = parseInt(regular.timestamp, 16)*1000;
      regular.time = new Date(regular.seconds);
    });
    afterEach(function(){
      //console.log(target.Cookie);
      tk.reset();
    });

    it('should parse valid cookie value', function() {
      var SessionData = target.User + ":" + target.TimeStr;
      var FullSecret = target.Secret + target.UserSalt;
      var Hash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(FullSecret, SessionData));
      var result = cca.parseCookie(target.Cookie);

      result.should.deep.equal({
        user: target.User,
        timestamp: target.TimeStr,
        hash:  Hash
      });
    });
    it('should fail to parse invalid cookie value', function() {
      (function(){
        cca.parseCookie(
          'RDZDRUE6vtRo2o6Rzrc');
      }).should.throw(Error);
    });
    it('should be invalid when bad user', function() {
      var time,
          SessionData,
          timestamp = parseInt(target.TimeStr, 16) * 1000,
          cookieVal;
      time = new Date(timestamp);
      tk.travel(time); // Mock system clock to reference date

      SessionData = 'invalidUser' + ":" + target.TimeStr;
      var FullSecret = target.Secret + target.UserSalt;
      var Hash = base64url.decodeAsBuffer(sha1.b64_hmac_sha1(FullSecret, SessionData));
      var plain = Buffer.concat([new Buffer(SessionData),new Buffer(":"), Hash]);
      var result = base64url.urlencode(new Buffer(plain));
      result = result.toString('binary');


      SessionData = 'invalid' + ":" + admin.timestamp;
      cookieVal = base64url.encode(SessionData + ':' + admin.hash);

      return cca.validCookie(cookieVal).should.become(false);
    });
    it('should return invalid on invalid hash', function() {
      var time,
          SessionData,
          timestamp = parseInt(target.TimeStr, 16);

          //nock.recorder.rec();

      scope.done();
      nock.cleanAll();
      scope = nock('http://104.236.41.70:80')
        .get('/_config/couch_httpd_auth/authentication_db')
        .reply(200, "_users")
        .get('/_users/org.couchdb.user%3Aadmin')
        .reply(404);

      time = new Date(timestamp*1000);
      tk.travel(time); // Mock system clock to reference date

      SessionData = target.User + ":" + target.TimeStr;
      var plain = Buffer.concat([new Buffer(SessionData),new Buffer(":"),new Buffer("invalid hash")]);
      var result = base64url.urlencode(new Buffer(plain));
      result = result.toString('binary');

      return cca.validCookie(result).should.become(false);
    });
    it('should return invalid when cookie expired', function() {
      var time,
          timestamp = (parseInt(target.TimeStr, 16) + 800
          )*1000; // future time in milliseconds

      time = new Date(timestamp);
      tk.travel(time); // Mock system clock to the future

      return cca.validCookie(target.Cookie).should.become(false);
    });
    it('should return valid when current time is within the timeout period', function() {
      var time,
          timestamp = (parseInt(target.TimeStr, 16) + 100
          )*1000;                             // future time in milliseconds

      time = new Date(timestamp);
      tk.travel(time); // Mock system clock to the future

      return cca.validCookie(target.Cookie).should.become(true);
    });
    it('should generate valid cookie', function() {
      var timestamp = parseInt(target.TimeStr, 16) * 1000;
      var time = new Date(timestamp);
      tk.travel(time); // Mock system clock to reference date

      var full = target.Secret + target.UserSalt;
      var result = cca.cookieValue(full, target.User, target.TimeStr);
      return cca.validCookie(result).should.become(true);
    });
    it('should return expected cookie value given user, timestamp, and secret', function() {
      var full = target.Secret + target.UserSalt;
      var result = cca.cookieValue(full, target.User, target.TimeStr);
      return result.should.deep.equal(target.Cookie);
    });
  });
  describe('makeCookie getCookieValue refreshCookie', function() {
    it('should return cookie with options that matche expected value', function() {
      /*
        cookie should be formatted correctly (options, etc)
      */
      return Promise.reject();
    });
    xit('should return empty cookie user not found', function() {
      // ...
    });
    xit('should return cookie submitted cookie is invalid', function() {
      // ...
    });
    xit('should refresh a valid cookie at less than 90% of timeout', function() {
      // ...
    });
    xit('should not refresh a valid cookie at 90% or more of timeoutt', function() {
      // ...
    });
  });
  describe('getCookieOptions', function() {

    beforeEach(function(){
      var config = cca.config;

      delete process.env.NODE_ENV;
      delete process.env.COOKIE_DOMAIN;
      delete process.env.COUCHDB_SSL;
      delete process.env.COUCHDB_NO_HTTPS;

      var env = config.default('env');
      config.loadFile('./config/' + env + '.json');

      // setting credentials resets url http/https per config settings
      return cca.setUserPass(config.get('dbUser'),  config.get('dbPass'))
      .then(function(result) {
        return result.config.should.deep.equal(cca.server.config);
      });
    });

    afterEach(function(){
      var config = cca.config;

      delete process.env.NODE_ENV;
      delete process.env.COOKIE_DOMAIN;
      delete process.env.COUCHDB_SSL;
      delete process.env.COUCHDB_NO_HTTPS;

      var env = config.default('env');
      config.loadFile('./config/' + env + '.json');

      // setting credentials resets url http/https per config settings
      return cca.setUserPass(config.get('dbUser'),  config.get('dbPass'))
      .then(function(result) {
        return result.config.should.deep.equal(cca.server.config);
      });
    });

    it('should set the cookie-domain to the couchdb config domain value', function() {
      process.env.COOKIE_DOMAIN = 'example.com';
      var env = cca.config.default('env');
      cca.config.loadFile('./config/' + env + '.json');

      return cca.getCookieOptions()
      .then(function(options) {
        return options.should.have.property('domain', 'example.com');
      });
    });
    it('should set the secure flag if ssl', function() {
      process.env.COUCHDB_SSL = 'true';
      process.env.COUCHDB_NO_HTTPS = 'false';
      var env = cca.config.default('env');
      cca.config.loadFile('./config/' + env + '.json');

      return cca.getCookieOptions()
      .then(function(options) {
        return options.should.have.property('secure', true);
      });

    });
    it('should not set the secure flag if not ssl', function() {
      process.env.COUCHDB_SSL = 'false';
      process.env.COUCHDB_NO_HTTPS = 'false';
      var env = cca.config.default('env');
      cca.config.loadFile('./config/' + env + '.json');

      return cca.getCookieOptions()
      .then(function(options) {
        return options.should.not.have.property('secure');
      });

    });
    it('should not set the secure flag if ssl and override', function() {
      process.env.COUCHDB_SSL = 'true';
      process.env.COUCHDB_NO_HTTPS = 'true';
      var env = cca.config.default('env');
      cca.config.loadFile('./config/' + env + '.json');

      return cca.getCookieOptions()
      .then(function(options) {
        return options.should.not.have.property('secure');
      });

    });
    describe('maxAge', function() {
      var scope = nock('http://104.236.41.70:80');

      beforeEach(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80');
        scope.done();
        return test_helper.resetConfig(cca);
      });
      afterEach(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
          .reply(200);

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "allow_persistent_cookies", "false")
          .then(function() {
            if (!scope.isDone()) {
              console.error('pending mocks: %j', scope.pendingMocks());
            }
            return Promise.resolve();
          });
      });

      it('should return 0 if allow_persistent_cookies is false', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
          .reply(200, '"false"')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, '"false"');

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "allow_persistent_cookies", "false")
        .then(function() {
          return cca.maxAge().should.eventually.become(0);
        });
      });

      it('should return the value of "_config/couch_httpd_auth/timeout" if allow_persistent_cookies is true', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"true"')
          .reply(200, '"false"')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, '"true"')
          .get('/_config/couch_httpd_auth/timeout')
          .reply(200, '"600"');

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "allow_persistent_cookies", "true")
        .then(function() {
          return cca.maxAge().should.eventually.become(600);
        });
      });

      it('should set max-age if couch_httpd_auth/allow_persistent_cookies is true', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"true"')
          .reply(200, '"false"')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, '"true"')
          .get('/_config/couch_httpd_auth/timeout')
          .reply(200, '"600"');

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "allow_persistent_cookies", "true")
        .then(function() {
          return cca.getCookieOptions()
          .then(function(options) {
            return options.should.have.property('maxAge',600);
          });
        });
      });
      it('should not set max-age if couch_httpd_auth/allow_persistent_cookies is false', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
          .reply(200, '"false"')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, '"false"');

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "allow_persistent_cookies", "false")
        .then(function() {
          return cca.getCookieOptions()
          .then(function(options) {
            return options.should.not.have.property('maxAge');
          });
        });
      });

    });
  });
  describe('fullSecret', function() {
    describe('secret', function() {
      var scope = nock('http://104.236.41.70:80');
      //nock.recorder.rec();

      it('should read secret from couchdb server', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/secret', '"92de07df7e7a3fe14808cef90a7cc0d91"')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91")
          .get('/_config/couch_httpd_auth/secret')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91");

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "secret", "92de07df7e7a3fe14808cef90a7cc0d91")
          .then(function() {
            return cca.getServerSecret().should.eventually.become("92de07df7e7a3fe14808cef90a7cc0d91");
          });
      });
    });
    describe('salt', function() {

      var alt_db = 'alt_users',
          scope = nock('http://104.236.41.70:80');

      before(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/alt_users')
          .reply(201, {
            "ok": true
          });

        return nano.db.create(alt_db);
      });

      after(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .delete('/alt_users')
          .reply(200, {
            "ok": true
          })
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users");

        return nano.db.destroy(alt_db)
          .then(function() {
            //console.log('after destroy alt_db database');
            return Promise.join(
              test_helper.setServerConfig(cca.server, "couch_httpd_auth", "authentication_db", "_users"),
              test_helper.deleteServerAdmin(cca.server,'test_admin'),
              function(confRet, delRet) {
                //console.log(confRet);
                //console.log(delRet);
                scope.done();
                return Promise.resolve([confRet, delRet]);
              })
              .catch(function(err) {
                console.log(err);
                scope.done();
                return Promise.reject(err);
              });
          });
      });

      beforeEach(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {
            "error": "not_found",
            "reason": "deleted"
          })
          .put('/_users/org.couchdb.user%3Apatricia', {
            "name": "patricia",
            "password": "secret",
            "roles": [],
            "type": "user"
          })
          .reply(201, {
            "ok": true,
            "id": "org.couchdb.user:patricia",
            "rev": "1-a6294859a9f9a9982e2915fb18ee7d83"
          });

        return test_helper.createUser(testUser);

      });

      afterEach(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users")
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(200, {
            "_id": "org.couchdb.user:patricia",
            "_rev": "1-a6294859a9f9a9982e2915fb18ee7d83",
            "password_scheme": "pbkdf2",
            "iterations": 10,
            "name": "patricia",
            "roles": [],
            "type": "user",
            "derived_key": "dc1b08a2ec5226106fbc6dad3fc0e226ac8c2b4f",
            "salt": "fb275752e32d2b6ebbba5f687a188697"
          })
          .delete('/_users/org.couchdb.user%3Apatricia')
          .query({
            "rev": "1-a6294859a9f9a9982e2915fb18ee7d83"
          })
          .reply(200);

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "authentication_db", "_users")
        .then(function() {
          return test_helper.deleteUser(user)
          .then(function(result){
            scope.done();
            return Promise.resolve(result);
          });
        })
        .catch(function(err){
          console.log('there was an error');
          scope.done();
          return Promise.reject(err);
        });
      });

      it('should read salt from a server admin', function(done) {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Aadmin')
          .query({
            "revs_info": "true"
          })
          .reply(404);

        return test_helper.createServerAdmin(cca.server, 'test_admin', 'password')
        .then(function(result){ //jshint ignore:line
          if (process.env.NOCK_OFF === 'true') {
            // can't know actual value of salt when running against live server
            return cca.getUserSalt(user).should.resolve;
          } else {
            return cca.getUserSalt(user)
              .should.eventually.become("");
          }
        })
        .catch(function(err) {
          //console.log(err);
          return Promise.reject(err);
        }).should.notify(done);
      });

      it('should read salt from user document', function(done) {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Apatricia')
          .query({
            "revs_info": "true"
          })
          .reply(200, {
            "_id": "org.couchdb.user:patricia",
            "_rev": "1-a6294859a9f9a9982e2915fb18ee7d83",
            "password_scheme": "pbkdf2",
            "iterations": 10,
            "name": "patricia",
            "roles": [],
            "type": "user",
            "derived_key": "dc1b08a2ec5226106fbc6dad3fc0e226ac8c2b4f",
            "salt": "fb275752e32d2b6ebbba5f687a188697",
            "_revs_info": [{
              "rev": "1-a6294859a9f9a9982e2915fb18ee7d83",
              "status": "available"
            }]
          });

        return Promise.resolve()
        .then(function() {
          if (process.env.NOCK_OFF === 'true') {
            // can't know actual value of salt when running against live server
            return cca.getUserSalt(user).should.resolve;
          } else {
            return cca.getUserSalt(user)
              .should.eventually.become("fb275752e32d2b6ebbba5f687a188697");
          }
        })
        .catch(function(err) {
          //console.log(err);
          return Promise.reject(err);
        }).should.notify(done);
      });

      it('should respect couchdb user database config setting', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"alt_users"')
          .reply(200, "_users")
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "alt_users")
          .get('/alt_users/org.couchdb.user%3Apatricia')
          .query({
            "revs_info": "true"
          })
          .reply(404);

        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "authentication_db", alt_db)
          .then(function() {
            // user was created in '_users' database, will not be found in alternate
            return cca.getUserSalt(user).should.be.rejected;
          });
      });

      it('should throw if user is not found', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Ainvalid%20user')
          .query({
            "revs_info": "true"
          })
          .reply(404);

        return cca.getUserSalt("invalid user").should.be.rejected;
      });

    });
    describe('full', function() {
      var scope = nock('http://104.236.41.70:80'),
        user = 'patricia';


      afterEach(function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(200, {
            "_id": "org.couchdb.user:patricia",
            "_rev": "1-a6294859a9f9a9982e2915fb18ee7d83",
            "password_scheme": "pbkdf2",
            "iterations": 10,
            "name": "patricia",
            "roles": [],
            "type": "user",
            "derived_key": "dc1b08a2ec5226106fbc6dad3fc0e226ac8c2b4f",
            "salt": "fb275752e32d2b6ebbba5f687a188697"
          })
          .delete('/_users/org.couchdb.user%3Apatricia')
          .query({
            "rev": "1-a6294859a9f9a9982e2915fb18ee7d83"
          })
          .reply(200);

        //console.log('a test');

        return test_helper.deleteUser(user)
        .then(function(result){
          scope.done();
          return Promise.resolve(result);
        })
        .catch(function(err){
          console.log('user not deleted');
          scope.done();
          return Promise.reject(err);
        });
      });


      it('should return a full secret given a user', function() {
        scope.done();
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/secret', '"92de07df7e7a3fe14808cef90a7cc0d91"')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91")

          .get('/_config/couch_httpd_auth/secret')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91")

          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users")

          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"})
          .put('/_users/org.couchdb.user%3Apatricia', {"name":"patricia","password":"secret","roles":[],"type":"user"})

          .reply(201, {"ok":true,"id":"org.couchdb.user:patricia","rev":"1-487c1c7fb8804d3b56f66e953d68a5ff"})
          .get('/_config/couch_httpd_auth/authentication_db')

          .reply(200, "_users")
          .get('/_users/org.couchdb.user%3Apatricia')
          .query({"revs_info":"true"})
          .reply(200, {"_id":"org.couchdb.user:patricia","_rev":"1-487c1c7fb8804d3b56f66e953d68a5ff","password_scheme":"pbkdf2","iterations":10,"name":"patricia","roles":[],"type":"user","derived_key":"ad9f2e2dfba330029c315dd3ad345a4604920200","salt":"7ed5cf1e5b8b24e0d9bbd13792034135","_revs_info":[{"rev":"1-487c1c7fb8804d3b56f66e953d68a5ff","status":"available"}]});


        //nock.recorder.rec();
        return test_helper
          .setServerConfig(cca.server,
            "couch_httpd_auth", "secret", "92de07df7e7a3fe14808cef90a7cc0d91")
        .then(function() {
          return test_helper.createUser(testUser);
        })
        .then(function(result) {  // jshint ignore:line
          if (process.env.NOCK_OFF === 'true') {
            // can't know actual value of salt when running against live server
            return cca.fullSecret(user).should.be.fulfilled;
          } else {
            return cca.fullSecret(user)
              .should.eventually.become("92de07df7e7a3fe14808cef90a7cc0d917ed5cf1e5b8b24e0d9bbd13792034135");
          }
        })
        .catch(function(err){
          //console.log(err);
          return Promise.reject(err);
        });
      });
    });
  });
});
describe('getDbConfig', function() {
  var scope = nock('http://104.236.41.70:80');

  beforeEach(function() {
    scope.done();
    nock.cleanAll();
    scope = nock('http://104.236.41.70:80');
    return test_helper.resetConfig(cca);
  });
  afterEach(function() {
    scope.done();
    nock.cleanAll();
    scope = nock('http://104.236.41.70:80')
      .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
      .reply(200);

    return test_helper
      .setServerConfig(cca.server,
        "couch_httpd_auth", "allow_persistent_cookies", "false")
      .then(function() {
        if (!scope.isDone()) {
          console.error('pending mocks: %j', scope.pendingMocks());
        }
        return Promise.resolve();
      });
  });

  it('should return the value of an existing config value', function() {
    scope.done();
    nock.cleanAll();
    scope = nock('http://104.236.41.70:80')
      .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"true"')
      .reply(200, '"false"')
      .get('/_config/couch_httpd_auth/allow_persistent_cookies')
      .reply(200, '"true"');

    return test_helper
      .setServerConfig(cca.server,
        "couch_httpd_auth", "allow_persistent_cookies", "true")
      .then(function() {
        return cca.getConfig("couch_httpd_auth", "allow_persistent_cookies", "false")
          .should.eventually.become('true');
      });
  });

  it('should return the default value for config key not found', function() {
    scope.done();
    nock.cleanAll();
    scope = nock('http://104.236.41.70:80')
      .get('/_config/couch_httpd_auth/XXX')
      .reply(404, {
        "error": "not_found",
        "reason": "unknown_config_value"
      });


    return cca.getConfig("couch_httpd_auth", "XXX", "true")
      .should.eventually.become('true');
  });

  it('should return an error for errors other than Not Found', function() {
    scope.done();
    nock.cleanAll();
    scope = nock('http://104.236.41.70:80')
      .get('/_config/couch_httpd_auth/allow_persistent_cookies')
      .reply(401, {
        "error": "unauthorized",
        "reason": "You are not a server admin."
      });

    return cca.setUserPass('invalid', '')
    .then(function() {
      return cca.getConfig("couch_httpd_auth", "allow_persistent_cookies", "true")
        .should.be.rejected.and.eventually.have.property("statusCode", 401);
    });

  });
});
describe('Config', function() {

/*jshint -W030 */
  it('should have a config object with properties dbHost, dbPort', function() {
    cca.config.has('dbHost').should.be.true;
    cca.config.has('dbPort').should.be.true;
  });
  it('should have a config object with properties dbUser, dbPass', function() {
    cca.config.has('dbUser').should.be.true;
    cca.config.has('dbPass').should.be.true;
  });
  it('should have a config object with property env', function() {
    cca.config.has('env').should.be.true;
    cca.config.get('env').should.equal('development');
  });
  it('should have a config object with property noHttps', function() {
    cca.config.has('noHttps').should.be.true;
    cca.config.get('noHttps').should.be.false;
  });
/*jshint +W030 */
  it('should use https to connect to server if dbSsl is true', function() {
    var config = cca.config;

    cca.config.load({
      "dbSsl": true
    });
    // setting credentials resets url http/https per config settings
    return cca.setUserPass(config.get('dbUser'),  config.get('dbPass'))
    .then(function(result) {
      return result.config.url.should.startWith('https');
    });
  });
  it('should use http to connect to server if dbSsl is false', function() {
    var config = cca.config;

    cca.config.load({
      "dbSsl": true
    });
    // setting credentials resets url http/https per config settings
    return cca.setUserPass(config.get('dbUser'),  config.get('dbPass'))
    .then(function(result) {
      return result.config.url.should.startWith('http');
    });
  });
  it('should accept an object and override config settings', function() {
    cca.config.load({
      "env": "qa",
      "dbHost": "localhost",
      "dbPort": 1337,
      "dbUser": "admin_user",
      "dbPass": "password",
      "noHttps": true,
      "dbSsl": true //,
    });
    /*jshint -W030*/
    cca.config.get('dbHost').should.equal('localhost');
    cca.config.get('dbPort').should.equal(1337);
    cca.config.get('dbUser').should.equal('admin_user');
    cca.config.get('dbPass').should.equal('password');
    cca.config.get('env').should.equal('qa');
    cca.config.get('noHttps').should.be.true;
    cca.config.get('dbSsl').should.be.true;
    /*jshint +W030*/
  });
  it('should give config environment variables priority over config file properties', function() {
    process.env.COUCHDB_USER = 'boo';
    var env = cca.config.default('env');
    cca.config.loadFile('./config/' + env + '.json');
    cca.config.get('dbUser').should.equal('boo'); //jshint ignore: line
  });

});
