/*jslint node: true, unparam: true, vars: true, es5: true, white: true*/
/*jshint curly: true, eqeqeq: true, immed: true, es5: true, -W030, newcap: true, noarg: true, undef: true, unused: true, latedef: true, boss: true, eqnull: true, laxcomma: true, sub: true, node: true, mocha: true*/
'use strict';

var couchdb_cookie_auth = require('../lib/couchdb-cookie-auth.js'),
    chai = require('chai'),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    test_helper = require('./spec_helper'),
    Promise = require("bluebird"),
    fixtures = require('./nockFixtures/fixtures'),
    nock = require('nock'),
    nano = couchdb_cookie_auth.server;

chai.use(chaiAsPromised);
fixtures.mocks(nock);

describe('Cookie', function() {

    describe('validCookie', function() {
        xit('should accept cookie if set within config timeout period', function() {
            // ...
        });
        xit('should reject cookie if not set within config timeout period', function() {
            // ...
        });
    });
    describe('makeCookie', function() {
        xit('should return auth cookie string given username and vhost', function() {
            // ...
        });
        xit('should return a cookie string with an options object', function() {
            // ...
        });
        xit('should clear a cookie', function() {
            // ...
        });
    });
    describe('getCookieOptions', function() {
        xit('should set the cookie-domain to the couchdb config vhost setting', function() {
            // ...
        });
        xit('should set the secure flag consistent with connection if no override', function() {
            // ...
        });
        xit('should set the secure flag consistent with override', function() {
            // ...
        });
        xit('should set max-age if couch_httpd_auth/allow_persistent_cookies is true', function() {
            // ...
        });
    });
    describe('getCookieValue', function() {
        xit('should clear a cookie if user not found', function() {
            // ...
        });
        xit('should clear a cookie if cookie is not valid -- expired', function() {
            // ...
        });
        xit('should return a new cookie string given cookie within sliding timeout', function() {
            // ...
        });
    });
    describe('fullSecret', function() {
        describe('secret', function() {
        });
        describe('salt', function() {
        });
        describe('full', function() {
        });

        var db,
            user = 'patricia',
            rev,
            alt_db = 'alt_users',
            scope;

        // create dummy user
        var dummy = {
          name: user,
          password: 'secret',
          roles: [],
          type: 'user'
        };

        before(function() {
            return nano.db.create(alt_db).then(function(result){
                return Promise.resolve();
            });

        });
        after(function() {
            return nano.db.destroy(alt_db)
            .then( function(result) {
                return test_helper.setServerConfig(couchdb_cookie_auth.server,
                    "couch_httpd_auth", "authentication_db", "_users");
            });
        });

        beforeEach(function(){
            nock.cleanAll();
            scope = nock('http://104.236.41.70:80');
            scope.done();

            return couchdb_cookie_auth.getAuthDb()
            .then(function(authDb) {
                db = nano.use(authDb);
                return db.get('org.couchdb.user:' + user)
                .spread(function(body, headers) {
                    rev = body._rev;
                    return Promise.resolve(rev);
                })
                .then(null, function(err) {
                    if (err.cause.statusCode === 404) {
                        return db.insert(dummy, 'org.couchdb.user:' + user)
                        .spread(function(body, headers) {
                            rev = body.rev;
                        })
                        .then(null, function(err) {
                            if (err.cause.statusCode === 409) {
                                return Promise.resolve();
                            }
                            return Promise.reject(err);
                        });
                    } else {
                        return Promise.reject(err);
                    }
                });
            });
        });

        afterEach(function(){

            return test_helper
                .setServerConfig(couchdb_cookie_auth.server,
                                "couch_httpd_auth", "authentication_db", "_users")
            .then(function() {
                couchdb_cookie_auth.getAuthDb()
                .then(function(authDb) {
                    db = nano.use(authDb);
                    return db.get('org.couchdb.user:' + user)
                    .spread(function(body, headers) {
                        rev = body._rev;
                        return db.destroy('org.couchdb.user:' + user, rev)
                        .then(function(result) {
                            //console.log("deleted new user: " + user + " in database: " + authDb);
                            return Promise.resolve();
                        });
                    })
                    .then(null, function(err) {
                        if (err.cause.statusCode === 404) {
                            //console.log("user not deleted: not found: " + user + " in database: " + authDb);
                            return Promise.resolve();
                        } else {
                            return Promise.reject(err);
                        }
                    });
                });
            });
        });

        it('should read salt from user document', function(done) {

            if (process.env.NOCK_OFF === 'true' ) {
                // can't know actual value of salt when running against live server


                return couchdb_cookie_auth.getUserSalt(user).then(null,function(err) {
                    console.log(err);
                    if (err.cause.statusCode === 404) {
                        return Promise.reject('Not Found');
                    } else {
                        return Promise.reject('Error: statusCode is not 404')
                    }
                }).should.notify(done);


            } else {
                return couchdb_cookie_auth.getUserSalt(user).should.eventually.become("382f6f369e0470ff0ac657a5b5e0f4c0");
            }

        });

        it('should respect couchdb user database config setting', function() {
            return test_helper
                .setServerConfig(couchdb_cookie_auth.server,
                                "couch_httpd_auth", "authentication_db", alt_db)
            .then(function(result) {
                // user was created in '_users' database, will not be found in alternate
                return couchdb_cookie_auth.getUserSalt(user).should.be.rejected;
            });
        });

        it('should throw if user is not found', function() {
            return couchdb_cookie_auth.getUserSalt("invalid user").should.be.rejected;
        });

        xit('should return a full secret given a user', function() {
            // ...
        });

        it('should read secret from couchdb server', function() {
            return test_helper
                .setServerConfig(couchdb_cookie_auth.server,
                                "couch_httpd_auth", "secret", "92de07df7e7a3fe14808cef90a7cc0d91")
            .then(function() {
                return couchdb_cookie_auth.getServerSecret().should.eventually.become("92de07df7e7a3fe14808cef90a7cc0d91");
            });
        });
    });
    describe('maxAge', function() {
        var scope;

        beforeEach(function(){
            nock.cleanAll();
            scope = nock('http://104.236.41.70:80');
            scope.done();
            return test_helper.resetConfig(couchdb_cookie_auth);
        });
        afterEach(function() {
            scope.done();
            scope = nock('http://104.236.41.70:80')
              //.log(console.log)
              .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
              .reply(200);

            return test_helper
                .setServerConfig(couchdb_cookie_auth.server,
                                "couch_httpd_auth", "allow_persistent_cookies", "false")
            .then(function(result) {
                if (!scope.isDone()) {
                  console.error('pending mocks: %j', scope.pendingMocks());
                }
            });
        });

        it('should return 0 if allow_persistent_cookies is false', function() {
            scope = nock('http://104.236.41.70:80')
              //.log(console.log)
              .get('/_config/couch_httpd_auth/allow_persistent_cookies')
              .reply(200, '"false"');

            return couchdb_cookie_auth.maxAge().should.eventually.become(0);
        });

        it('should return the value of "_config/couch_httpd_auth/timeout" if allow_persistent_cookies is true', function() {
            scope = nock('http://104.236.41.70:80')
              //.log(console.log)
              .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"true"')
              .reply(200, '"false"')
              .get('/_config/couch_httpd_auth/allow_persistent_cookies')
              .reply(200, '"true"')
              .get('/_config/couch_httpd_auth/timeout')
              .reply(200, '"600"');

            return test_helper
                .setServerConfig(couchdb_cookie_auth.server,
                                "couch_httpd_auth", "allow_persistent_cookies", "true")
            .then(function() {
                return couchdb_cookie_auth.maxAge().should.eventually.become(600);
            });
        });

    });

});

describe('getDbConfig', function() {
    var scope;

    beforeEach(function(){
        nock.cleanAll();
        scope = nock('http://104.236.41.70:80');
        scope.done();
        return test_helper.resetConfig(couchdb_cookie_auth);
    });
    afterEach(function() {
        scope.done();
        scope = nock('http://104.236.41.70:80')
          //.log(console.log)
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"false"')
          .reply(200);

        return test_helper
            .setServerConfig(couchdb_cookie_auth.server,
                            "couch_httpd_auth", "allow_persistent_cookies", "false")
        .then(function(result) {
            if (!scope.isDone()) {
              console.error('pending mocks: %j', scope.pendingMocks());
            }
        });
    });

    it('should return the value of an existing config value', function() {

        scope = nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', '"true"')
          .reply(200, '"false"')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, '"true"');

        return test_helper
            .setServerConfig(couchdb_cookie_auth.server,
                            "couch_httpd_auth", "allow_persistent_cookies", "true")
        .then(function() {
            return couchdb_cookie_auth.getConfig("couch_httpd_auth", "allow_persistent_cookies", "false")
            .should.eventually.become('true');
        });
    });

    it('should return the default value for config key not found', function() {
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/XXX')
          .reply(404, {"error":"not_found","reason":"unknown_config_value"});


        return couchdb_cookie_auth.getConfig("couch_httpd_auth", "XXX", "true")
        .should.eventually.become('true');
    });

    it('should return an error for errors other than Not Found', function() {
        scope = nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(401, {"error":"unauthorized","reason":"You are not a server admin."});

        return couchdb_cookie_auth.setUserPass('invalid','')
        .then(function (result) {
            return couchdb_cookie_auth.getConfig("couch_httpd_auth", "allow_persistent_cookies", "true")
            .should.be.rejected.and.eventually.have.property("statusCode",401);
        });

    });
});
describe('Config', function() {
    it('should have a config object with properties dbHost, dbPort', function() {
        couchdb_cookie_auth.config.has('dbHost').should.be.true;
        couchdb_cookie_auth.config.has('dbPort').should.be.true;
    });
    it('should have a config object with properties dbUser, dbPass', function() {
        couchdb_cookie_auth.config.has('dbUser').should.be.true;
        couchdb_cookie_auth.config.has('dbPass').should.be.true;
    });
    it('should have a config object with property env', function() {
        couchdb_cookie_auth.config.has('env').should.be.true;
        couchdb_cookie_auth.config.get('env').should.equal('development');
    });
    it('should have a config object with property noHttps', function() {
        couchdb_cookie_auth.config.has('noHttps').should.be.true;
        couchdb_cookie_auth.config.get('noHttps').should.be.false;
    });
    it('should accept an object and override config settings', function() {
        couchdb_cookie_auth.config.load({
            "env": "qa",
            "dbHost": "localhost",
            "dbPort": 1337,
            "dbUser": "admin_user",
            "dbPass": "password",
            "noHttps": true,
            "dbSsl": true//,
        });
        couchdb_cookie_auth.config.get('dbHost').should.equal('localhost');
        couchdb_cookie_auth.config.get('dbPort').should.equal(1337);
        couchdb_cookie_auth.config.get('dbUser').should.equal('admin_user');
        couchdb_cookie_auth.config.get('dbPass').should.equal('password');
        couchdb_cookie_auth.config.get('env').should.equal('qa');
        couchdb_cookie_auth.config.get('noHttps').should.be.true;
        couchdb_cookie_auth.config.get('dbSsl').should.be.true;
    });
    it('should give config environment variables priority over config file properties', function() {
        process.env.COUCHDB_USER = 'boo';
        var env = couchdb_cookie_auth.config.default('env');
        couchdb_cookie_auth.config.loadFile('./config/' + env + '.json');
        couchdb_cookie_auth.config.get('dbUser').should.equal('boo');
    });

});

