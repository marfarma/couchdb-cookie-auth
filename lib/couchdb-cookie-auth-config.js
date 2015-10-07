/*jslint node: true, unparam: true, vars: true, es5: true, white: true*/

/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */



var convict = require('convict');

// define a schema
var config = module.exports = convict({
    env: {
        doc: "The applicaton environment.",
        format: ["production", "development", "test"],
        default: "development",
        env: "NODE_ENV"
    },
    dbHost: {
        doc: "The host address for the couchdb server.",
        format: "url",
        default: "127.0.0.1",
        env: "COUCHDB_URL"
    },
    domain: {
        doc: "The domain name to use for the auth cookie.",
        format: "*",
        default: "",
        env: "COOKIE_DOMAIN"
    },
    dbPort: {
        doc: "The port for the couchdb server.",
        format: "port",
        default: 5984,
        env: "COUCHDB_PORT"
    },
    dbUser: {
        doc: "The admin username for the couchdb server.",
        format: String,
        default: "admin",
        env: "COUCHDB_USER"
    },
    dbPass: {
        doc: "The admin password for the couchdb server.",
        format: String,
        default: "relax",
        env: "COUCHDB_PASS"
    },
    noHttps: {
        doc: "If true, force cookie option secure off when connection is https",
        format: Boolean,
        default: false,
        env: "COUCHDB_NO_HTTPS"
    },
    dbSsl: {
        doc: "If true, assume schema is https",
        format: Boolean,
        default: false,
        env: "COUCHDB_SSL"
    }
});


// load environment dependent configuration

var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// perform validation
config.validate();
