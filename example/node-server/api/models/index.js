/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

var smartdb = require('smartdb');
var Promise = require('bluebird');
var requireDirectory = require('require-directory');
module.exports = requireDirectory(module);


var db = smartdb({
    databases: [
        {
            url: 'http://localhost:5984/userdb',
            entities: {
                user: { }
            }
        },
        {
            url: 'http://localhost:5984/blogdb',
            entities: {
                blogPost: { },
                blogComment: { }
            }
        }
    ],
    // This is optional. It enables you to map from document to entity
    /*jshint -W117*/
    mapDocToEntity: function (doc) {
        var type = doc.type;
        if (type === 'user') {return new User(doc);}
        if (type === 'blogPost') {return new BlogPost(doc);}
        if (type === 'blogComment') {return new BlogComment(doc);}

        throw new Error('Unsupported entity type: ' + type);
    }
    /*jshint +W117*/
});

module.exports.db = db;
