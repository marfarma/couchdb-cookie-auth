/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var jwt = require('jwt-simple');
var config = require('./config.js');
var nodemailer = require('nodemailer');
var mandrillTransport = require('nodemailer-mandrill-transport');
//var User = require('../models/User.js');

var model = {
    verifyUrl: 'http://localhost:3000/auth/verifyEmail?token=',
    title: 'psJwt',
    subTitle: 'Thanks for signing up!',
    body: 'Please verify your email address by clicking the button below!'
};

exports.send = function (email) {
    var payload = {
		sub: email
	};

	var token = jwt.encode(payload, config.EMAIL_SECRET);

    var transporter = nodemailer.createTransport(mandrillTransport ({
        auth: {
            apiKey: config.SMTP_PASS
        }
    }));

    var mailOptions = {
        to: email,
        from: 'pauli.price@gmail.com',
        subject: 'psJwt Account Verification',
        html: getHtml(token)
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('email sent ', info);
        }
    });
};

exports.handler = function(req, res) {
    var token = req.query.token;

    var payload = jwt.decode(token, config.EMAIL_SECRET);
    var email = payload.sub;

    if (!email) {return handleError(res);}

//    User.findOne({email: email}, function (err, foundUser) {
//      if (err) return res.status(500);
//
//      if (!foundUser) return handleError(res);
//
//      if (!foundUser.active) {
//        foundUser.active = true;
//
//        foundUser.save(function (err) {
//            if (err) return res.status(500);
//
//            return res.redirect(config.APP_URL);
//        });
//      }
//    });

};

function getHtml(token) { //jshint ignore:line
    var path = './views/emailVerification.html';
    // use async read in production apps
    var html = fs.readFileSync(path.encoding = 'utf8');

    var template = _.template(html);

    model.verifyUrl += token;

    return template(model);
}

function handleError(res) {//jshint ignore:line


    return res.status(401).send({
        message: 'Authentication failed, unable to verify email'
    });

}
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

