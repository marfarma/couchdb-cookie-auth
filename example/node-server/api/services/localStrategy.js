/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var User = require('../models').UserModel;
var LocalStrategy = require('passport-local').Strategy;

var strategyOptions = {
  usernameField: 'email'
};

exports.login = new LocalStrategy(strategyOptions, function (email, password, done) {

  var searchUser = {
    email: email
  };

  User.findOne(searchUser, function (err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, {
        message: 'Wrong email/password'
      });
    }

    user.comparePasswords(password, function (err, isMatch) {
      if (err) {
        return done(err);
      }

      if (!isMatch) {
        return done(null, false, {
          message: 'Wrong email/password'
        });
      }
      return done(null, user);
    });
  });
});

exports.register = new LocalStrategy(strategyOptions, function (email, password, done) {

  var searchUser = {
    email: email
  };

  User.findOne(searchUser, function (err, user) {
    if (err) {
      return done(err);
    }

    if (user) {
      return done(null, false, {
        message: 'email already exists'
      });
    }

    var newUser = new User({
      email: email,
      password: password
    });

    newUser.save(function (err) { //jshint ignore:line
      done(null, newUser);
    });
  });
});
