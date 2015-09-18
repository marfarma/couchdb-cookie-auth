/*jslint node: true, unparam: true, vars: true, es5: true, white: true, nomen: true*/

'use strict';

(function () {

    var couchdb_cookie_auth = require('../lib/couchdb-cookie-auth.js'),
        nano = couchdb_cookie_auth.server,
        nock = require('nock'),  // jshint ignore:line
        Promise = require("bluebird");

    var resetConfig = function(couchdb_cookie_auth){
        var env = couchdb_cookie_auth.config.get('env');
        var config = couchdb_cookie_auth.config;

        config.loadFile('./config/' + env + '.json');
        couchdb_cookie_auth.setUserPass(config.get('dbUser'), config.get('dbPass'));
    };

    function setServerConfig(server, section, key, value) {
        // _config/couch_httpd_auth/allow_persistent_cookies
        return server.request({
            method : 'PUT',
            path: '_config/' + section + '/' + key,
            body: value
        })
        .then(function(body) {
            return Promise.resolve([body]);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    }

    // deletes user and return a promise. Resolves to the db success message
    // or rejected with the db error response respectively.
    //
    function deleteUser(user) {
      var db;

      return couchdb_cookie_auth.getAuthDb()
      .then(function(authDb) {
          db = nano.use(authDb);
          return db.get('org.couchdb.user:' + user);
      })
      .spread(function(body, headers) {  // jshint ignore:line
        return db.destroy('org.couchdb.user:' + user, body._rev)
        .then(function(result) {  // jshint ignore:line
          return Promise.resolve(result);
        });
      })
      .catch(function(err) {
        return Promise.reject(err);
      });
    }

    // creates a db user from provided object
    // object should minimally contain the following properties
    // name, password, roles (an array) and type = 'user'
    // for example.
    //
    //            var userObj = {
    //              name: user_name,
    //              password: 'secret',
    //              roles: [],
    //              type: 'user'
    //            };
    //
    // returns a promise that resolves to the db success or
    // is rejected with the db error response respectively.
    // If the user exists it's resolved with its current value.
    //
    function createUser(userObj) {
      var db,
          user = userObj.name;

      return couchdb_cookie_auth.getAuthDb()
      .then(function(authDb) {
          db = nano.use(authDb);
          return db.get('org.couchdb.user:' + user);
      })
      .spread(function(body, headers) {  // jshint ignore:line
          return Promise.resolve(body);
      })
      .catch(function(err) {
          if (err.cause.statusCode === 404) {
              return db.insert(userObj, 'org.couchdb.user:' + user)
              .spread(function(body, headers) {  // jshint ignore:line
                return Promise.resolve(body);
              });
          } else {
              console.log('err is not *Not Found*');
              console.log(err);
              return Promise.reject(err);
          }
      })
      .catch(function(err) {
        return Promise.reject(err);
      });
    }

    module.exports = {
        resetConfig: resetConfig,
        createUser: createUser,
        deleteUser: deleteUser,
        setServerConfig: setServerConfig
    };

}());
