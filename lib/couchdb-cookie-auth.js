/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

  module.exports = (function () {

    // Private variables
    var secret, salt;
    var config = require('./config.js');
    
    return {
      config : config
    };

  })();
  
  