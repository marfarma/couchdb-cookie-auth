/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var smartdb = require('smartdb');
//var Promise = require('bluebird');

// automatically require all models
//var requireDirectory = require('require-directory');
//module.exports = requireDirectory(module);

var db = smartdb({
    databases: [
        {
            url: 'http://192.168.99.100:5984/_users',
            entities: {
                user: { }
            }
        }
    ],
    // This is optional. It enables you to map from document to entity
    /*jshint -W117*/
    mapDocToEntity: function (doc) {
        var type = doc.type;
        if (type === 'user') {return new User(doc);}
        throw new Error('Unsupported entity type: ' + type);
    },
    /*jshint +W117*/
    rewriteView: function (type, viewName) {
        return [type + '-' + viewName, 'fn'];
    }
});

module.exports.db = db;
