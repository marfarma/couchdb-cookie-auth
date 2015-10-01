/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

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
var mongoose = require('mongoose');

//var jwt = require('jwt-simple');
var passport = require('passport');

//var request = require('request');
var facebookAuth = require('./services/facebookAuth.js');
var localStrategy = require('./services/localStrategy.js');
//var models = require('./services/models.js');
var emailVerification = require('./services/emailVerification.js');
var createSendToken = require('./services/jwt.js');
var googleAuth = require('./services/googleAuth.js');

var app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', 'http://localhost:9000');
//    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

passport.use('local-register', localStrategy.register);
passport.use('local-login', localStrategy.login);

/////////////////////////////////////////////////////////////
// Authentication & Registration Routes
/////////////////////////////////////////////////////////////
app.post('/register',
    passport.authenticate('local-register'), function (req,res) {
        emailVerification.send(req.user.email);
        createSendToken(req.user, res);
});

app.get('/auth/verifyEmail', emailVerification.handler);


app.post('/login',
    passport.authenticate('local-login'), function(req, res) {
        createSendToken(req.user, res);
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


mongoose.connect('mongodb://localhost/psjwt');

var server = app.listen(3000, function () {
    console.log('api listening on ', server.address().port);
});

