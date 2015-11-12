/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var User = require('../models/User.js');
var user = new User();
var request = require('request');
var createSendToken = require('./jwt.js');
var config = require('./config.js');
var isJSON = require('is-json');

module.exports = function (req, res) {

  var url = 'https://accounts.google.com/o/oauth2/token';
  var apiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
//  console.log('top of the google auth function');
//  console.log(req.body);
//  console.log(req.body.clientId);
//  console.log(req.body.redirectUri);

  var params = {
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    code: req.body.code,
    grant_type: 'authorization_code',
    client_secret: config.GOOGLE_SECRET
  };

//  console.log('params: ', params);


  request.post(url, {
 //   json: true,
    form: params
  }, function (err, response, token) {
    //console.log(response);
//    console.log('top of the google auth post callback function');
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
//      console.log('got token back from mock google', token);
      if (isJSON(token)) {
        token = JSON.parse(token);
      }
//      console.log('typeof token: ',typeof token);
      if (token.error !== undefined) {
        console.log('error: ', token);
        var error = token.error;
        if (token.error_description !== undefined) {
          error = error + ': ' + token.error_description;
        }
        res.status(400).send(error);
      } else {
//        console.log('top of the google auth post callback function');
        //console.log(token);
        var accessToken = token.access_token;

        var headers = {
          Authorization: 'Bearer ' + accessToken
        };

        request.get({
          url: apiUrl,
          headers: headers,
          json: true
        }, function (err, response, profile) {
//          console.log('top of the google auth get profile callback function');
          if (err) {
            console.log(err);
            res.status(400).send(err);
          } else {
            user.findOneByAuthProvider('google', profile.sub,
              function (err, foundUser) {
                console.log('top of the google auth findOneByAuthProvider callback function');
                if (err) {
                  console.log(err);
                  res.status(400).send(err);
                } else {
                  if (foundUser) {
                    console.log(foundUser);
                    return createSendToken(foundUser, res);
                  }
                  // check if email exists
                  user.findOneByAuthProvider('email', profile.sub,
                    function (err, foundUser) {
                      if (err) {
                        console.log(err);
                        res.status(400).send(err);
                      } else {
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
                      }
                    });
                }
              });
          }
        });
      }
    }
  });
};
