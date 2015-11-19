#!/usr/bin/env node

/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */
/*jshint -W069 */
'use strict';

  // Mike McKay - May 22, 2015 at 5:14 am - in a comment on this blog post: http://blogs.bytecode.com.au/glen/2015/05/18/a-tiny-cup-of-couchdb.html
  //I’ve also been frustrated by 3rd party hosting. Iriscouch is unreliable. Smilleupps has a terrible user interface. Cloudant is expensive overkill. Then I realized that deploying couchdb in the cloud is unlike a lot of other server side deployments. All you need is CouchDB. No other web server, no installation of a database, or rails stack or anything. If you get an empty DigitalOcean CoreOS server for $5 a month, then install a docker image of couchdb, you are done. I think this is the reason 3rd party hosting is kind of crappy – there’s not much value to be added, since so much is in bog standard couchdb.
  //
  //ssh core@yourdigitaloceanserver
  //docker pull marfarma/couchdb
  //docker run -d -p 80:5984 –name couchdb marfarma/couchdb
var models = require('./models').models; //jshint ignore:line


(function (){
  var express = require('express');
  var bodyParser = require('body-parser');
  var passport = require('passport');
  var facebookAuth = require('./services/facebookAuth.js');
  var localStrategy = require('./services/localStrategy.js');
  var emailVerification = require('./services/emailVerification.js');
  var createSendToken = require('./services/jwt.js');
  var googleAuth = require('./services/googleAuth.js');
  var readline = require('readline');
  var Promise = require('bluebird'); //jshint ignore:line
  Object.assign = require('object-assign');
  var provision = {};
//  var record = require('./test/record');
//  var nock = require('nock');

  module.exports = provision.server = function(callback) {

    var CONFIG = {};
    var section = process.argv[2];
    var port = 0;

    var log = function(mesg) {
      console.log(JSON.stringify(["log", mesg]));
    };


    var app = express();

    app.use(bodyParser.json());
    app.use(passport.initialize());

    passport.serializeUser(function (user, done) {
      done(null, user.id);
    });
    passport.use('local-register', localStrategy.register);
    passport.use('local-login', localStrategy.login);


    //TODO: Read these values out of the server config
    //Set CORS headers
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Origin', 'http://localhost:9000');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        next();
    });

    app.get('/auth/test', function(req, res) {
           res.send("The proxy is working");
    });

    /////////////////////////////////////////////////////////////
    // Authentication & Registration Routes
    /////////////////////////////////////////////////////////////
    //
    // 'local (username, password) routes
    app.post('/auth/login',
        passport.authenticate('local-login'), function(req, res) {
            createSendToken(req.user, res);
    });
    app.post('/auth/register',
        passport.authenticate('local-register'), function (req,res) {
            emailVerification.send(req.user.email);
            createSendToken(req.user, res);
    });
    app.get('/auth/verifyEmail', emailVerification.handler);

    // 'remote' routes
    app.post('/auth/facebook', facebookAuth);
    app.post('/auth/google', googleAuth);

    /////////////////////////////////////////////////////////////
    // Start Listener - Get config from CouchDB
    /////////////////////////////////////////////////////////////
    if (!module.parent) {  // OS daemon listener uses couchdb stdin/stdout
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      port = 8100; //default port
      rl.question(JSON.stringify(['get', section]) + '\n', function(answer) {
        CONFIG[section] = JSON.parse(answer);
        if (CONFIG[section].port) {
          port = parseInt(CONFIG[section].port);
        }
        app.listen(port, function() {
          log('provisioning service listening on port '+ port);
          if (callback) { callback(); }
        }
        );
      });

      // CouchDB (i.e. stdin), close event fired, stop http server')
      rl.on('close', function() {
        if (app.close) {app.close();}
        if (callback) { callback(); }
      });

    } else {  // testing at port 8100

      app.listen(8100, function() {
        log('provisioning service listening on port ' + 8100);
        if (callback) { callback(); }
      });

    }
  };

  if (!module.parent) {
    provision.server();
  }
})();

