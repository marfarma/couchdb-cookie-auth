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
// commandline to start mongodb server from terminal
// mongod --config /usr/local/etc/mongod.conf

// Mike McKay - May 22, 2015 at 5:14 am - in a comment on this blog post: http://blogs.bytecode.com.au/glen/2015/05/18/a-tiny-cup-of-couchdb.html
//I’ve also been frustrated by 3rd party hosting. Iriscouch is unreliable. Smilleupps has a terrible user interface. Cloudant is expensive overkill. Then I realized that deploying couchdb in the cloud is unlike a lot of other server side deployments. All you need is CouchDB. No other web server, no installation of a database, or rails stack or anything. If you get an empty DigitalOcean CoreOS server for $5 a month, then install a docker image of couchdb, you are done. I think this is the reason 3rd party hosting is kind of crappy – there’s not much value to be added, since so much is in bog standard couchdb.
//
//ssh core@yourdigitaloceanserver
//docker pull klaemo/couchdb
//docker run -d -p 80:5984 –name couchdb klaemo/couchdb

var express = require('express');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
var passport = require('passport');
var facebookAuth = require('./services/facebookAuth.js');
var localStrategy = require('./services/localStrategy.js');
//var models = require('./services/models.js');
var emailVerification = require('./services/emailVerification.js');
var createSendToken = require('./services/jwt.js');
var googleAuth = require('./services/googleAuth.js');
var readline = require('readline');
var Promise = require('bluebird'); //jshint ignore:line

var CONFIG = {};
var section = process.argv[2];

var log = function(mesg) {
  console.log(JSON.stringify(["log", mesg]));
};

//function hexEncode(string){
//    var hex, i;
//
//    var result = "";
//    for (i=0; i<string.length; i++) {
//        hex = string.charCodeAt(i).toString(16);
//        result += ("000"+hex).slice(-4);
//    }
//
//    return result;
//}


var app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//TODO: Read these values out of the server config
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

passport.use('local-register', localStrategy.register);
passport.use('local-login', localStrategy.login);

/////////////////////////////////////////////////////////////
// Authentication & Registration Routes
/////////////////////////////////////////////////////////////
app.post('/auth/register',
    passport.authenticate('local-register'), function (req,res) {
        emailVerification.send(req.user.email);
        createSendToken(req.user, res);
});

app.get('/auth/verifyEmail', emailVerification.handler);


app.post('/auth/login',
    passport.authenticate('local-login'), function(req, res) {
        createSendToken(req.user, res);
});


app.post('/auth/test', function(req, res) {
       res.send("The proxy is working");
});

app.post('/auth/facebook', facebookAuth);

app.post('/auth/google', googleAuth);

/////////////////////////////////////////////////////////////
// Rest API
/////////////////////////////////////////////////////////////
//app.post('/api/:model', models.create);
//
//app.get('/api/:model', models.list);
//
//app.get('/api/:model/:id', models.get);
//
//app.put('/api/:model/:id', models.update);
//
//app.del('/api/:model/:id', models.delete);

//mongoose.connect('mongodb://localhost/psjwt');

// OS daemon stdin listener

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question(JSON.stringify(['get', 'httpd']) + '\n', function(answer) {
  CONFIG['httpd'] = JSON.parse(answer);

// check the bind address and port
  var bind_address = CONFIG['httpd'].bind_address;
  if (!bind_address || bind_address === '0.0.0.0') {
    CONFIG['httpd'].bind_address = '127.0.0.1';
  }
  var port = CONFIG['httpd'].port;
  if (!port) {
    CONFIG['httpd'].port = '8200';
  }

  rl.question(JSON.stringify(['get', section]) + '\n', function(answer) {
    CONFIG[section] = JSON.parse(answer);
    log(answer);

    if (CONFIG[section].port) {
      app.listen(parseInt(CONFIG[section].port), function() {
        log('provisioning service listening on port '+CONFIG[section].port);
      });
    }
  });

});

rl.on('close', function() {
  // Close event fired, stop http server')
  app.close();
});



