/*jslint node: true, unparam: true, vars: true, es5: true, white: true, nomen: true*/

'use strict';

(function () {

  var cca = require('../lib/couchdb-cookie-auth.js'),
      nano = cca.server,
      nock = require('nock'),  // jshint ignore:line
      Promise = require("bluebird");


  var resetConfig = function(couchdb_cookie_auth){
      var env = couchdb_cookie_auth.config.get('env');
      var config = couchdb_cookie_auth.config;

      config.loadFile('./config/' + env + '.json');
      couchdb_cookie_auth.setUserPass(config.get('dbUser'), config.get('dbPass'));
      // console.log(config);
  };


  var getAuthCookie = function(couchdb_cookie_auth) {
    return couchdb_cookie_auth.server.auth(
      couchdb_cookie_auth.config.get('dbUser'),
      couchdb_cookie_auth.config.get('dbPass')
    )
    .spread(function(body, headers) {
      console.log(headers);
      return Promise.resolve(headers);
    })
    .catch(function(err) {
      console.log(err);
      return Promise.reject(err);
    });
  };


    function setServerConfig(server, section, key, value) {
        // _config/couch_httpd_auth/allow_persistent_cookies
        return server.request({
            method : 'PUT',
            path: '_config/' + section + '/' + key,
            body: String(value)
        })
        .then(function(body) {
            return Promise.resolve([body]);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    }


    // creates a server admin and returns a promise. Resolves to the db success message
    // or rejected with the db error response respectively.
    //
    function createServerAdmin(server, name, password) {
      // PUT http://localhost:5984/_config/admins/{name} -d '{password}'

        return server.request({
            method : 'PUT',
            path: '_config/admins/' + name,
            body: password
        })
        .then(function(body) {
            return Promise.resolve([body]);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });
    }

    function fixClock(tk, TimeStr) {
        var timestamp = parseInt(TimeStr, 16) * 1000;
        tk.travel(new Date(timestamp)); // Mock system clock to reference date
    }

    function freezeClock(tk, TimeStr) {
        var timestamp = parseInt(TimeStr, 16) * 1000;
        tk.freeze(new Date(timestamp)); // Mock system clock to reference date and freeze it
    }

    // deletes a server admin and returns a promise. Resolves to the db success message
    // or rejected with the db error response respectively. NB: resolves if not found
    //
    function deleteServerAdmin(server, name) {
      // PUT http://localhost:5984/_config/admins/{name} -d '{password}'

        return server.request({
            method : 'GET',
            path: '_config/admins'
        })
        .spread(function(body, headers){ //jshint ignore:line
          //console.log(body);
          if ( body.hasOwnProperty(name) ) {
            //console.log('admin account found, deleting.');
            return server.request({
                method : 'DELETE',
                path: '_config/admins/' + name
            })
            .then(function(body) {
              //console.log('deleted admin account: ' + name);
              return Promise.resolve(body);
            });
          }
          return Promise.resolve();
        })
        .catch(function(err) {
          console.log(err);
          return Promise.reject(err);
        });
    }

    // deletes user and return a promise. Resolves to the db success message
    // or rejected with the db error response respectively.
    //
    function deleteUser(user) {
      var db;

      return cca.getAuthDb()
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

      return cca.getAuthDb()
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
              console.log('err is other than *Not Found*');
              console.log(err);
              return Promise.reject(err);
          }
      })
      .catch(function(err) {
        return Promise.reject(err);
      });
    }

    module.exports = {
      getAuthCookie: getAuthCookie,
        resetConfig: resetConfig,
        createUser: createUser,
        deleteUser: deleteUser,
        setServerConfig: setServerConfig,
      createServerAdmin: createServerAdmin,
      deleteServerAdmin: deleteServerAdmin,
      fixClock: fixClock,
      freezeClock: freezeClock
    };

}());
