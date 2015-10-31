/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

/*jshint -W069, -W098 */

'use strict';

// Usage:
//        exists.call(db, 'documentToCheck', function(check) {
//            console.log(check);
//        });
//
var exists = function( id , cb) {

    this.head( id, function( err, body, header ) {
      if ( header[ 'status-code' ] === 200 ) {
          cb(true);
        }
        else if ( err[ 'status-code' ] === 404 ) {
          cb(false);
        }
        cb(false);
    });
};

module.exports.exists = exists;
