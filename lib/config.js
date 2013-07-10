var convict = require('convict');

// define a schema
var config = module.exports = convict({
  env: {
    doc: "The applicaton environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  dbUrl: {
    doc: "The URL address for the couchdb server.",
    format: "url",
    default: "http://127.0.0.1",
    env: "COUCHDB_URL",
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
  clockMaxDiff: {
    doc: "Max allowed difference between couchdb server and local server clock time.",
    default: "5 minute",
    format: "duration",
    env: "COUCHDB_MAX_DIFF"
  }
});


// load environment dependent configuration

var env = config.get('env');
config.loadFile('./config/' + env + '.json');

// perform validation

config.validate();

