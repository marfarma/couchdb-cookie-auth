'use strict';

var couchdb_cookie_auth = require('../lib/couchdb-cookie-auth.js'),
    should = require('should');

  describe('Cookie', function () {
    xit ('should return auth cookie string given username and vhost', function () {
    // ...
    });
    xit ('should set the cookie domain to the couchdb config vhost setting', function () {
    // ...
    });
    xit ('should set the secure flag consistent with connection if no override', function () {
    // ...
    });
    xit ('should set the secure flag consistent with override', function () {
    // ...
    });
    xit ('should accept cookie if set within config timeout period', function () {
    // ...
    });
    xit ('should reject cookie if not set within config timeout period', function () {
    // ...
    });
    xit ('should return a cookie string including options object', function () {
    // ...
    });
    xit ('should return a new cookie string including options object given a cookie', function () {
    // ...
    });
    xit ('should clear a cookie', function () {
    // ...
    });
    xit ('should clear a cookie if user not found', function () {
    // ...
    });
    xit ('should clear a cookie if cookie is not valid', function () {
    // ...
    });
    xit ('should read cookie timeout setting from couchdb server', function () {
    // ...
    });
  });
  describe('Server', function () {
    xit ('should raise an exception if couchdb login fails', function () {
    // ...
    });
    xit ('should raise an exception if couchdb login is not admin', function () {
    // ...
    });
    xit ('should connect to a couchdb as admin user', function () {
    // ...
    });
    xit ('should create required design document if missing', function () {
    // ...
    });
    xit ('should read secret from couchdb server', function () {
    // ...
    });
    xit ('should validate couchdb server clock against node server clock', function () {
      // http://stackoverflow.com/a/6146567/149060 - couchdb show function returns current time
      // ...
    });
    xit ('should throw if couchdb server clock and node server clock difference exceeds variance', function () {
    // ...
    });
    xit ('should find a user by name', function () {
    // ...
    });
    xit ('should read salt from couchdb user document', function () {
    // ...
    });
    xit ('should respect couchdb user database config setting', function () {
    // ...
    });
  });
  describe('Config', function () {
    it ('should have a config object with properties dbUrl, dbPort', function () {
      //(typeof couchdb_cookie_auth.config).should.equal('convict');
      couchdb_cookie_auth.config.has('dbUrl').should.be.true;
      couchdb_cookie_auth.config.has('dbPort').should.be.true;
    // ...
    });
    it ('should have a config object with properties dbUser, dbPass', function () {
      couchdb_cookie_auth.config.has('dbUser').should.be.true;
      couchdb_cookie_auth.config.has('dbPass').should.be.true;
    // ...
    });
    it ('should have a config object with property env', function () {
      couchdb_cookie_auth.config.has('env').should.be.true;
      couchdb_cookie_auth.config.get('env').should.equal('development');
    // ...
    });
    //config.get('env')
    it ('should have a config object with property noHttps', function () {
      couchdb_cookie_auth.config.has('noHttps').should.be.true;
      couchdb_cookie_auth.config.get('noHttps').should.be.false;
    // ...
    });
    it ('should have a config object with property clockMaxDiff', function () {
      couchdb_cookie_auth.config.has('clockMaxDiff').should.be.true;
      couchdb_cookie_auth.config.get('clockMaxDiff').should.equal(5 * 60 * 1000); // milliseconds
    // ...
    });
    it ('should accept an object and override config settings', function () {
      couchdb_cookie_auth.config.load({
        "env": "qa",
        "dbUrl": "http://localhost",
        "dbPort": 1337,
        "dbUser":  "admin_user",
        "dbPass":  "password",
        "noHttps": true,
        "clockMaxDiff": "3 minute"
      });
      couchdb_cookie_auth.config.get('dbUrl').should.equal('http://localhost');
      couchdb_cookie_auth.config.get('dbPort').should.equal(1337);
      couchdb_cookie_auth.config.get('dbUser').should.equal('admin_user');
      couchdb_cookie_auth.config.get('dbPass').should.equal('password');
      couchdb_cookie_auth.config.get('env').should.equal('qa');
      couchdb_cookie_auth.config.get('noHttps').should.be.true;
      couchdb_cookie_auth.config.get('clockMaxDiff').should.equal(3 * 60 * 1000); // milliseconds
    // ...
    });
    it ('should give config environment variables priority over config file properties', function () {
      process.env.COUCHDB_USER = 'boo';
      var env = couchdb_cookie_auth.config.default('env');
      couchdb_cookie_auth.config.loadFile('./config/' + env + '.json');
      couchdb_cookie_auth.config.get('dbUser').should.equal('boo');
    // ...
    });
  });
  
  


