/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

/*jshint -W069, -W098 */

'use strict';

var db = require('./index.js');
var util = require('util');

function addViews() {
    var design_doc = {};

  util.exists.call(db, '_design/user-all', function(check) {
    console.log(check);
    if (!check) {
      design_doc = {
        views: {}
      };
      design_doc.views['fn'] = {
        "map": "function(doc) { if (doc.type == 'user') { emit(null, doc); } }"
      };
      db.insert(design_doc, '_design/user-all', function (err, body) {
        if (err) {
          console.log(err);
        }
      });
    }
  });


  design_doc = {
    views: {}
  };
  design_doc.views['fn'] = {
    "map": "function(doc) { if (doc.type == 'user' && doc.authkeys.length > 0) {for (var idx in doc.authkeys) { emit([doc.authkeys[idx].provider, doc.authkeys[idx].id], doc);}}}"
  };
  db.insert(design_doc, '_design/user-by_authprovider_id', function (err, body) {
    if (err) {
      console.log(err);
    }
  });

  design_doc = {
    views: {}
  };
  design_doc.views['fn'] = {
    "map": "function(doc) { if (doc.type == 'user') { emit(doc.name, doc); } }"
  };
  db.insert(design_doc, '_design/user-by_username', function (err, body) {
    if (err) {
      console.log(err);
    }
  });

  design_doc = {
    views: {}
  };
  design_doc.views['fn'] = {
    "map": "function(doc) { if (doc.type == 'user') { emit(doc.family_name, doc); } }"
  };
  db.insert(design_doc, '_design/user-by_lastname', function (err, body) {
    if (err) {
      console.log(err);
    }
  });
}

function User(props, cb) {

  this.type = "user";

  if (props.name) {
    this.name = props.name;
    this._id = 'org.couchdb.user:' + this.name;
  } else {
    if (cb) {cb(new TypeError('Error: name is required.'));}
  }

  if (props.given_name) {
    this.given_name = props.given_name;
  }

  if (props.family_name) {
    this.family_name = props.family_name;
  }

  if (props.roles) {
    this.roles = props.roles;
  } else {
    this.roles = [];
  }

  this.authkeys = [];
  if (props.googleId) {
    this.authkeys.push({
      provider: "google",
      id: props.googleId
    });
  }

  if (props.facebookId) {
    this.authkeys.push({
      provider: "facebook",
      id: props.facebookId
    });
  }

  if (props.twitterId) {
    this.authkeys.push({
      provider: "twitter",
      id: props.twitterId
    });
  }

  if (props.githubId) {
    this.authkeys.push({
      provider: "github",
      id: props.githubId
    });
  }

  if (props.email) {
    this.authkeys.push({
      provider: "email",
      id: props.email
    });
  }

  if ((this.authkeys.length === 0) && (!props.password)) {
    if (cb) {cb(new TypeError('Error: no authentiation provider found.'));}
  }

  if (props.password) {
    this.password = props.password;
  } else {
    // generate if not present, validate that an authProvider exists
    if (this.authkeys.length > 0) {
      this.password = 'notSet';
    } else {
      if (cb) {cb(new TypeError('Error: no authentiation provider found.'));}
    }
  }
  if (cb) {cb(null, this);}
}

// If you are using entity mappings, the returned users are real entities
function all(cb) {
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
}

function findByLastName(name, cb) {
  db.view('user-by_lastname', 'fn', {
    key: name
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
}

function findOneByUsername(name, cb) {
  db.view('user-by_username', 'fn', {
    key: name
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
}

function findOneByAuthProvider(provider, id, cb) {
  db.view('user-by_authprovider_id', 'fn', {
      key: [provider, id]
    },
    function (err, user) {
      if (err) {
        if (cb) {
          cb(err);
        }
      }
      if (cb) {
        cb(null, user);
      }
    });
}

module.exports = {
  findOneByAuthProvider: findOneByAuthProvider,
  findOneByUsername: findOneByUsername,
  findByLastName: findByLastName,
  all: all,
  addViews: addViews
};


//var UserSchema = mongoose.Schema({
//    email: String,
//    password: String,
//    googleId: String,
//    facebookId: String,
//    displayName: String,
//    active: Boolean
//});
//UserSchema.methods.toJSON = function () {
//    var user = this.toObject();
//    delete user.password;
//    console.log(user);
//    return user;
//};
//UserSchema.methods.comparePasswords = function (password, callback) {
//    console.log(this);
//    bcrypt.compare(password, this.password, callback);
//};

//UserSchema.pre('save', function(next) {
//    var user = this;
//
//    if (!user.isModified('password')) {return next();}
//
//    bcrypt.genSalt(10, function (err, salt) {
//        if (err) {return next(err);}
//
//        bcrypt.hash(user.password, salt, null,
//                    function (err, hash) {
//            if (err) {return next(err);}
//
//            user.password = hash;
//            next();
//        });
//    });
//});
//
//module.exports = mongoose.model('User', UserSchema);
