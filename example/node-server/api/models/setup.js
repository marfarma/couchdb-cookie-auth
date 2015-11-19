/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 * test
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var debug = require('debug')('setup');

var KeepAliveAgent = require('agentkeepalive').HttpsAgent;

var myagent = new KeepAliveAgent({
  maxSockets: 256,
  maxFreeSockets: 256,
  keepAliveTimeout: 60 * 1000,
  maxKeepAliveRequests: 0,
  maxKeepAliveTime: 240000
});

var db_config = {
  databases: [
    {
      url: 'https://admin:admin@192.168.99.100/_users',
      entities: {
        user: {}
      }
    }
  ],
    requestDefaults : { "agent" : myagent },
    rewriteView: function (type, viewName) {
      return [viewName, 'fn'];
    }
};

//

module.exports.db_config = db_config;
//var models = require('require-all')(__dirname);
//debug('require User: ', models.User);
//module.exports.models = models;

