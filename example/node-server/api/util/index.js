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

  function ensureViewExists(db, viewName, fn) {
    exists.call(db, viewName, function(check) {
      console.log(check);
      if (!check) { //view not found
        var design_doc = {
          views: {}
        };
        design_doc.views['fn'] = fn;
        db.insert(design_doc, viewName, function (err, body) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }

  function hexEncode(string){
      var hex, i;

      var result = "";
      for (i=0; i<string.length; i++) {
          hex = string.charCodeAt(i).toString(16);
          result += ("000"+hex).slice(-4);
      }

      return result;
  }


module.exports.exists = exists;
module.exports.hexEncode = hexEncode;
module.exports.ensureViewExists = ensureViewExists;
