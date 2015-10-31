'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var request = require('request').defaults({strictSSL: false}); //jshint ignore:line
var db = require('nano')({
  request_defaults: {strictSSL: false},
  url: 'https://admin:admin@192.168.99.100/_users'
});
var data = require('random-fixture-data');
var user, i;


data.define('user', function() {

   var given_name = data.first_name;
   var family_name = data.last_name;
   var name = given_name+family_name;
   name = name.toLowerCase();

  return {
    name: name,
    _id: 'org.couchdb.user:'+name,
    password: data.password,
    type: "user",
    given_name: given_name,
    family_name:family_name,
    roles: [
    ],
    authkeys: [
      {
        provider:"google",
        id: data.card_number()
      },
      {
        provider:"facebook",
        id: data.card_number()
      },
      {
        provider:"twitter",
        id: data.card_number()
      },
      {
        provider:"github",
        id: data.card_number()
      },
      {
        provider:"email",
        id: data.email
      }
    ]
  };
});

function cb(err, body) {
  if (!err) {
  //  console.log(body);
  } else {
    console.log(err);
  }
}

for (i=0; i<200; i++) {
  user = data.user;
  //console.log(user);
  db.insert(user, user._id, cb);
}
