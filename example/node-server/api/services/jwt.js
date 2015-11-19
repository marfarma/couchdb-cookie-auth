/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';
var jwt = require('jwt-simple');
var moment = require('moment');
var cca = require('couchdb-cookie-auth');
var debug = require('debug')('makecookie');

module.exports = function (user, res) {
  debug('called createAndSendToken with user: ', user);
  debug('res: ', res);
  console.trace('check the stack');
  var payload = {
    sub: user.id,
    exp: moment().add(10, 'days').unix()
  };
  cca.makeCookie(user.name)
  .then(function(cookie) {
    debug('promise resolved makeCookie: ', cookie);
    console.log(cookie);
    res.setHeader('Set-Cookie', cookie);

    var token = jwt.encode(payload, "shhh..");
    res.status(200).send({
      user: JSON.stringify(user),
      token: token
    });
  }).catch(function(err){
    debug('promise rejected makeCookie: ', err);
//    throw new Error(err);
  });
};
