/*jslint node: true, unparam: true, vars: true, es5: true, white: true*/
/*jshint curly: true, eqeqeq: true, immed: true, es5: true, -W030, newcap: true, noarg: true, undef: true, unused: true, latedef: true, boss: true, eqnull: true, laxcomma: true, sub: true, node: true, mocha: true*/
'use strict';

var couchdb_cookie_auth = require('../lib/couchdb-cookie-auth.js'),
    chai = require('chai'),
    chaiAsPromised = require("chai-as-promised"),
    should = chai.should(),
    test_helper = require('./spec_helper'),
    mocks = require('./nockFixtures/fixtures'),
    nock = require('nock'),
    nano = couchdb_cookie_auth.server;

chai.use(chaiAsPromised);

// setup http request / response mocks
mocks(nock);

describe('Cookie', function() {
    xit('should return auth cookie string given username and vhost', function() {
        // ...
    });
    xit('should set the cookie-domain to the couchdb config vhost setting', function() {
        // ...
    });
    xit('should set the secure flag consistent with connection if no override', function() {
        // ...
    });
    xit('should set the secure flag consistent with override', function() {
        // ...
    });
    xit('should accept cookie if set within config timeout period', function() {
        // ...
    });
    xit('should reject cookie if not set within config timeout period', function() {
        // ...
    });
    xit('should return a cookie string with an options object', function() {
        // ...
    });
    xit('should return a new cookie string including options object given a cookie', function() {
        // ...
    });
    xit('should clear a cookie', function() {
        // ...
    });
    xit('should clear a cookie if user not found', function() {
        // ...
    });
    xit('should clear a cookie if cookie is not valid', function() {
        // ...
    });
});

describe('getConfig', function() {

    // reset config
    beforeEach(function(){
        test_helper.resetConfig(couchdb_cookie_auth);
    });

    it('should return the value of an existing config value', function() {
        return test_helper
            .setServerConfig(couchdb_cookie_auth.server,
                            "couch_httpd_auth", "allow_persistent_cookies", "false")
        .then(function() {
            return couchdb_cookie_auth.getConfig("couch_httpd_auth", "allow_persistent_cookies", "false")
            .should.eventually.become('false');
        });
    });

    it('should return the default value for config key not found', function() {
        return couchdb_cookie_auth.getConfig("couch_httpd_auth", "XXX", "true")
        .should.eventually.become('true');
    });

    it('should return an error for errors other than Not Found', function() {

        return couchdb_cookie_auth.setUserPass('invalid','')
        .then(function (result) {
            return couchdb_cookie_auth.getConfig("couch_httpd_auth", "allow_persistent_cookies", "true")
            .should.be.rejected.and.eventually.have.property("statusCode",401);
        });

    });
});
describe('maxAge', function() {
    // reset config
    beforeEach(function(){
        test_helper.resetConfig(couchdb_cookie_auth);
    });

    it('should return 0 if allow_persistent_cookies is false', function() {
        return couchdb_cookie_auth.maxAge().should.eventually.become(0);
    });

    it('should return the value of "_config/couch_httpd_auth/timeout" if allow_persistent_cookies is true', function() {
        return test_helper
            .setServerConfig(couchdb_cookie_auth.server,
                            "couch_httpd_auth", "allow_persistent_cookies", "true")
        .then(function() {
            return couchdb_cookie_auth.maxAge().should.eventually.become(600);
        });
    });

});

describe('getUserSalt', function() {
    xit('should respect couchdb user database config setting', function() {
        // ...
        //        open_auth_db() ->
        //        DbName = ?l2b(couch_config:get("couch_httpd_auth", "authentication_db")),
        //        DbOptions = [{user_ctx, #user_ctx{roles = [<<"_admin">>]}}],
        //        {ok, AuthDb} = couch_db:open_int(DbName, DbOptions),
        //        AuthDb.
    });
    xit('should throw if user is not found', function() {
        // ...
    });

    it('should read salt from user document', function() {

        var db = nano.use('_users'),
            user = 'beth';

        // create dummy user
        var dummy = {
          name: user,
          password: 'secret',
          roles: [],
          type: 'user'
        };

        // add dummy user to db
        return db.insert(dummy, 'org.couchdb.user:' + user)
        .then(function(body) {

            // get user from db
            return db.get('org.couchdb.user:' + user, { revs_info: true })
            .then(function(user) {
                  //return user.salt;
            })
            .then(null, function(err) {
                 throw err;
            });

        });

    });

});

describe('Server', function() {
    it('should read secret from couchdb server', function() {
        return test_helper
            .setServerConfig(couchdb_cookie_auth.server,
                            "couch_httpd_auth", "secret", "92de07df7e7a3fe14808cef90a7cc0d91")
        .then(function() {
            return couchdb_cookie_auth.getServerSecret().should.eventually.become("92de07df7e7a3fe14808cef90a7cc0d91");
        });
    });
});

describe('Config', function() {

    it('should have a config object with properties dbHost, dbPort', function() {
        //(typeof couchdb_cookie_auth.config).should.equal('convict');
        couchdb_cookie_auth.config.has('dbHost').should.be.true;
        couchdb_cookie_auth.config.has('dbPort').should.be.true;
        // ...
    });
    it('should have a config object with properties dbUser, dbPass', function() {
        couchdb_cookie_auth.config.has('dbUser').should.be.true;
        couchdb_cookie_auth.config.has('dbPass').should.be.true;
        // ...
    });
    it('should have a config object with property env', function() {
        couchdb_cookie_auth.config.has('env').should.be.true;
        couchdb_cookie_auth.config.get('env').should.equal('development');
        // ...
    });
    it('should have a config object with property noHttps', function() {
        couchdb_cookie_auth.config.has('noHttps').should.be.true;
        couchdb_cookie_auth.config.get('noHttps').should.be.false;
        // ...
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
        // ...
    });
    it('should give config environment variables priority over config file properties', function() {
        process.env.COUCHDB_USER = 'boo';
        var env = couchdb_cookie_auth.config.default('env');
        couchdb_cookie_auth.config.loadFile('./config/' + env + '.json');
        couchdb_cookie_auth.config.get('dbUser').should.equal('boo');
        // ...
    });

});
