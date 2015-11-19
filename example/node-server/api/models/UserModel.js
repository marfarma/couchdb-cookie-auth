/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

/*jshint -W069, -W098, -W003 */

'use strict';

var debug = require('debug')('user');
//debug('index require: ', require('../models'));
//debug('db: ', db);
var smartdb = require('smartdb');
var db_config = require('./setup.js').db_config;
var util = require('../util');
var Promise = require('bluebird'); //jshint ignore:line
var config = require('../services/config.js');
var _ = require('underscore');
var config = _.extend(config, require('../config/development.json'));
debug('config: ', config);

var dbName;
var appName = 'cookie-auth-example';
var nanoDb = require('nano')({
  request_defaults: {
    strictSSL: false
  },
  url: 'https://admin:admin@192.168.99.100/'
});

// Extremely unsecure - removes self-signed certificate error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";




(function () {

  //===========================================================================
  // User Model Definition
  //
  // props Object - properties
  // {
  //   name         string       required
  //   given_name   string       optional
  //   family_name  string       optional
  //   roles        string array optional
  //   appNamespace string       required
  //   [googleId, facebookId, twitterId, githubId, email] string \
  //      one of the listed auth providers is required
  //   password     string       required
  //      optional when when email is not the only auth provider
  // }
  // cb     function   standard error first callback - function(err, user)
  //
  //===========================================================================

  function User(props, cb) {
    this.type = "user";

    if (props && props.name) {
      this.name = props.name;
      this._id = 'org.couchdb.user:' + this.name;
    } else {
      if (cb) {
        cb(new TypeError('Error: name is required.'));
      }
    }

    if (props && props.given_name) {
      this.given_name = props.given_name;
    }

    if (props && props.family_name) {
      this.family_name = props.family_name;
    }

    if (props && props.roles) {
      this.roles = props.roles;
    } else {
      this.roles = [];
    }

    this.authkeys = [];
    if (props && props.googleId) {
      this.authkeys.push({
        provider: "google",
        id: props.googleId
      });
    }

    if (props && props.facebookId) {
      this.authkeys.push({
        provider: "facebook",
        id: props.facebookId
      });
    }

    if (props && props.twitterId) {
      this.authkeys.push({
        provider: "twitter",
        id: props.twitterId
      });
    }

    if (props && props.githubId) {
      this.authkeys.push({
        provider: "github",
        id: props.githubId
      });
    }

    if (props && props.email) {
      this.authkeys.push({
        provider: "email",
        id: props.email
      });
    }

    if ((this.authkeys.length === 0) && props && (!props.password)) {
      if (cb) {
        cb(new TypeError('Error: no authentiation provider found.'));
      }
    }

    this.appNamespace = [];

    if (props && props.password) {
      this.password = props.password;
    } else {
      // generate if not present, validate that an authProvider exists
      if (this.authkeys.length > 0) {
        this.password = 'notSet'; // TODO: base64encoded username
      } else {
        if (cb) {
          cb(new TypeError('Error: no authentiation provider found.'));
        }
      }
    }
    // require an app namespace & create app-user database
    this.apps = [];
    if (cb) {
      cb(null, this);
    }
  }
//  var db = User.db ? User.db : ;
  if (! User.db) {
    db_config.mapDocToEntity = function (doc) {
      var type = doc.type;
      if (type === 'user') { return new User(doc); }
      throw new Error('Unsupported entity type: ' + type);
    };
    /*jshint +W117*/
    var db = smartdb(db_config);
  }

  //===========================================================================
  //
  // User Model Views
  //
  //
  //===========================================================================

  var modelViews = [];

  modelViews.push({
    name: '_design/user-all',
    fn: {
      "map": "function(doc) { if (doc.type == 'user') { emit(null, doc); } }"
    }
  });

  modelViews.push({
    name: '_design/user-by_authprovider_id',
    fn: {
      "map": "function(doc) { if (doc.type == 'user' && doc.authkeys.length > 0) {for (var idx in doc.authkeys) { emit([doc.authkeys[idx].provider, doc.authkeys[idx].id], doc);}}}"
    }
  });

  modelViews.push({
    name: '_design/user-by_username',
    fn: {
      "map": "function(doc) { if (doc.type == 'user') { emit(doc.name, doc); } }"
    }
  });

  modelViews.push({
    name: '_design/user-by_lastname',
    fn: {
      "map": "function(doc) { if (doc.type == 'user') { emit(doc.family_name, doc); } }"
    }
  });

  modelViews.map(function (view, idx) {
    var ndb = nanoDb.use('_users');
    util.ensureViewExists(ndb, view.name, view.fn);
  });

  //===========================================================================
  //
  // Query Methods
  // the object or array of objects returned are real entities of User
  //
  //
  //===========================================================================

  User.prototype.all = function (cb) {
    db.view('user-all', 'fn', null,
      function (err, users) {
        if (err) {
          if (cb) {
            cb(err);
          }
        }
        if (cb) {
          cb(null, users);
        }
      });
  };

  User.prototype.findByLastName = function (name, cb) {
    db.view('user-by_lastname', 'fn', {
      keys: name
    }, function (err, user) {
      if (err) {
        if (cb) {
          cb(err);
        }
      }
      if (cb) {
        cb(null, user);
      }
    });
  };

  User.prototype.findOneByUsername = function (name, cb) {
    db.view('user-by_username', 'fn', {
      keys: name
    }, function (err, user) {
      if (err) {
        if (cb) {
          cb(err);
        }
      }
      if (cb) {
        cb(null, user);
      }
    });
  };

  User.prototype.findOneByAuthProvider = function (provider, id, cb) {
//    var username = config.dbUser
//    , userpass = config.dbPass
//    , callback = console.log // this would normally be some callback
//    , cookies  = {} // store cookies, normally redis or something
//    ;
//    nanoDb.auth(username, userpass, function (err, body, headers) {
//      if (err) {
//        return callback(err);
//      }
//
//      if (headers && headers['set-cookie']) {
//        cookies[user] = headers['set-cookie'];
//      }
//
//      callback(null, "it worked");
//    });

//    nano {
//      method: 'POST',
//      headers: {
//        'content-type': 'application/json',
//        accept: 'application/json'
//      },
//      uri: 'https://admin:admin@192.168.99.100/_users/_design/user-by_authprovider_id/_view/fn',
//      qs: {
//        include_docs: true
//      },
//      body: '{"keys":["[google,5135461323057180]"]}'
//    }
    var query = [];
    var keys = [];
    keys.push(provider);
    keys.push(id);
    query.push(keys);
    debug('findOneByAuthProvider: query: ', query);

    var nanoOpts = { db: '_users',
      path: '_design/user-by_authprovider_id/_view/fn',
      method: 'POST',
      qs: { include_docs: true },
      body: {keys: query },
      url: 'https://admin:admin@192.168.99.100/'
    };
    debug('nanoOpts', nanoOpts);

    nanoDb.relax(nanoOpts);

    db.view('user',
      'user-by_authprovider_id', {
        keys: query
      },
      function (err, user) {
        if (err) {
          debug('view query error: ', err);
          if (cb) {
            cb(err);
          }
        } else {
          if (cb) {
            debug('user from view: ', user);
            cb(null, user);
          }
        }
      });
  };

  User.prototype.toJSON = function () {
    JSON.stringify(this);
  };

  User.prototype.save = function () {

    db.save(this, function (err) {
      if (err) {
//        return handleErr(err);
        debug('Error saving user: ', err);
      }
      // johnDoe._id and johnDoe._rev is automatically set by save()
    });
  };


  //===========================================================================
  //
  // Per-User Database Model Methods
  //
  //
  //===========================================================================

  User.prototype.createUserAppDb = function (appNamespace, cb) {
    var dbName;

    this.generateDbName(appNamespace)
      .then(this.createDatabase)
      .then(this.addSecurityDoc)
      .then(this.addDocUpdateDdoc)
      .then(function () {
        if (cb) {
          cb(null, this);
        }
      })
      .catch(function (err) {
        if (cb) {
          cb(err);
        }
      });
  };

  User.prototype.generateDbName = function (appNamespace) {
    //  A database must be named with all lowercase letters (a-z),
    //  digits (0-9), or any of the _$()+-/ characters and must end with
    //  a slash in the URL. The name has to start with a lowercase letter (a-z).
    dbName = 'com-taciko-user-' + appName + '-' + util.hexEncode(this._id);
    return dbName;
  };

  User.prototype.createDatabase = function (user) {
    return new Promise(function (resolve, reject) {

      nanoDb.db.create(dbName, function (err, body) {
        if (!err) {
          console.log('database ' + dbName + ' created!');
        }
      });

    });
  };

  User.prototype.addSecurityDoc = function (user) {
    return new Promise(function (resolve, reject) {
      var dbName = this.dbname;

      var security_doc = {
        members: {
          names: [],
          roles: [user.name]
        },
        admins: {
          names: [user.name],
          roles: []
        }
      };
      db.insert(security_doc, '/_security', function (err, body) {
        if (err) {
          console.log(err);
          return Promise.reject(err);
        }
        return Promise.resolve(this);
      });


    });
  };

  User.prototype.addDocUpdateDdoc = function (user) {
    return new Promise(function (resolve, reject) {
      var ddoc = {
        validate_doc_update: "function(new_doc, old_doc, userCtx) { if (userCtx.name != '" + user.name + "' && userCtx.roles.indexOf('" + user.name + "') == -1) { throw({forbidden: 'Not Authorized'}); } }"
      };

      //  dbname + '/_design/security',
      //      ddoc,
    });
  };

  module.exports = User;

})();
