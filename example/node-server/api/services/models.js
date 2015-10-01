/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

//var request = require('request');
//var qs = require('querystring');
//var config = require('./config.js');

(function() {

  var result;


  var create = function (req, res) {
    req.body.type = req.params.model;
    return res.json(result);
  };
  var list = function (req, res) {
    req.body.type = req.params.model;
    return res.json(result);
  };
  var get = function (req, res) {
    req.body.type = req.params.model;
    req.body.id = req.params.id;
    return res.json(result);
  };
  var update = function (req, res) {
    req.body.type = req.params.model;
    req.body.id = req.params.id;
    return res.json(result);
  };
  var del = function (req, res) {
    req.body.type = req.params.model;
    req.body.id = req.params.id;
    return res.json(result);
  };

  module.experts = {
    create: create,
    list: list,
    get: get,
    update: update,
    del: del
  };

})();
