/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var User = require('../models/User.js');
var request = require('request');
var createSendToken = require('./jwt.js');
var config = require('./config.js');

module.exports = function (req, res) {

  var url = 'https://accounts.google.com/o/oauth2/token';
  var apiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    code: req.body.code,
    grant_type: 'authorization_code',
    client_secret: config.GOOGLE_SECRET
  };

  //console.log('req.body: ',req.body);

  request.post(url, {
    json: true,
    form: params
  }, function (err, response, token) {
    var accessToken = token.access_token;

    var headers = {
      Authorization: 'Bearer ' + accessToken
    };

    request.get({
      url: apiUrl,
      headers: headers,
      json: true
    }, function (err, response, profile) {
      //console.log(Object.keys(profile));



      User.findOneByAuthProvider(['google', profile.sub],
        function (err, foundUser) {

        if (foundUser) {
          return createSendToken(foundUser, res);
        }

        // check if email exists
        User.findOneByAuthProvider(['google', profile.sub],
        function (err, foundUser) {
          if (foundUser) {
            // add auth provider to user
            return createSendToken(foundUser, res);
          }

        var newUser = new User();
//  ------ expected profile response
//      {
//        "kind": "plus#personOpenIdConnect",
//        "gender": string,
//        "sub": string,
//        "name": string,
//        "given_name": string,
//        "family_name": string,
//        "profile": string,
//        "picture": string,
//        "email": string,
//        "email_verified": "true",
//        "locale": string,
//        "hd": string
//      }


        newUser.googleId = profile.sub;
        newUser.displayName = profile.name;

        newUser.save(function (err) {
          if (err) {
            return next(err);
          }

          createSendToken(newUser, res);

        });
      });


    });
  });
});
};
