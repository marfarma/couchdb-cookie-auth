/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var User = require('../models').models.UserModel;
var user = new User();
var request = require('request');
var createSendToken = require('./jwt.js');
var config = require('./config.js');
var _ = require('underscore');
var config = _.extend(config, require('../config/development.json'));
var isJSON = require('is-json');
var debug = require('debug')('auth');

debug('User: ', User);

var KeepAliveAgent = require('agentkeepalive').HttpsAgent;

var myagent = new KeepAliveAgent({
  maxSockets: 256,
  maxFreeSockets: 256,
  keepAliveTimeout: 60 * 1000,
  maxKeepAliveRequests: 0,
  maxKeepAliveTime: 240000
});

module.exports = function (req, res) {

  var url = 'https://accounts.google.com/o/oauth2/token';
  var apiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  debug('top of the google auth function');
  debug(req.path);

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
    form: params,
    agent: myagent,
    timeout: 11500
  }, function (err, response, token) {
    //console.log(response);
    debug('top of the google auth post callback function: ');
    //    console.log('Error getting token: ', token);
    if (response.body) {debug('response.body', response.body);}
    if (err || response.body.name === 'Error') {
      debug('get token failed: ', err);
      res.status(400).send(err);
    } else {
      //      console.log('got token back from mock google', token);
      if (isJSON(token)) {
        token = JSON.parse(token);
      }
      //      console.log('token: ', token);
      debug('google auth request result: ', token);

      if (token.error !== undefined) {
        debug('token.error: ', token.error);
        var error = token.error;
        if (token.error_description !== undefined) {
          error = error + ': ' + token.error_description;
        }
        res.status(400).send(error);
      } else {
        var accessToken = token.access_token;
        debug('accessToken: ', accessToken);

        var headers = {
          Authorization: 'Bearer ' + accessToken
        };

        request.get({
          url: apiUrl,
          headers: headers,
          json: true
        }, function (err, response, profile) {
          debug('top of the google auth get profile callback function', profile);
          if (err) {
            debug('Error, could not get profile: ', apiUrl, err);
            res.status(400).send(err);
          } else {
            user.findOneByAuthProvider('google', profile.sub,
              function (err, foundUser) {
                debug('top of the google auth findOneByAuthProvider callback function');
                debug('google auth findOneByAuthProvider\[id\]: \[err, founduser\]', err, foundUser);
                if (err) {
                  debug('Error finding person: ', err);
                  res.status(400).send(err);
                } else {
                  debug('found user: ', foundUser);
                  if (foundUser && foundUser.length > 0) {
                    debug('foundUser auth provider id: ', foundUser);
                    return createSendToken(foundUser, res);
                  }
                  debug('user not found, check if email exists');
                  // check if email exists
                  user.findOneByAuthProvider('email', profile.sub,
                    function (err, foundUser) {
                    debug('google auth findOneByAuthProvider\[email\]: \[err, founduser\]', err, foundUser);
                    if (err) {
                        debug('Error checking email: ', err);
                        res.status(400).send(err);
                      } else {
                        if (foundUser && foundUser.length > 0) {
                          debug('foundUser email: ', foundUser);
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
                            debug('save error: ', err);
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
