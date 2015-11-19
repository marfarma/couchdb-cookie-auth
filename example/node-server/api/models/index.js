/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 * test
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var smartdb = require('smartdb');
var debug = require('debug')('models');
//var models = require('require-all')(__dirname);
var models = require('require-all')({
  dirname     :  __dirname,
  filter      :  /(.+Model)\.js$/,
  excludeDirs :  /^\.(git|svn)$/,
  recursive   : true
});

debug('require models: ', models);
var db_config = require('./setup.js').db_config;

/*jshint -W117*/
db_config.mapDocToEntity = function (doc) {
  var type = doc.type;
  if (type === 'user') { return new models.UserModel(doc); }
  throw new Error('Unsupported entity type: ' + type);
};
  /*jshint +W117*/

var db = smartdb(db_config);

for (var model in models) {
  debug('model loop in index: ', model);
  model.db = db;
}
debug('smartdb in index: ', db);
module.exports.db = db;
module.exports.models = models;
