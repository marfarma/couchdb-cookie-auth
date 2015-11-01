'use strict';
/*jshint mocha: true, node: true, -W030*/

//var querystring = require('querystring');
var assert = require("chai").assert;
var http   = require("http");
http.post = require('http-post');
var server = require("../api");
//var config = require('./config.js');
var nock = require('nock');

describe('api server tests', function() {
  //  //this.timeout = 10000;
  var app; //jshint ignore:line

  before(function(done){
     app = server(function(err) {
       if (err) {console.log(err);}
       done();
     });
    console.log(app);
  });
//
  it("should return a 200 response on test route", function (done) {
      http.get("http://localhost:8100/auth/test", function (res) {
          assert.equal(res.statusCode, 200);
          done();
      });
  });

  it("should return a 404 response on a get of google strategy", function (done) {
      http.get("http://localhost:8100/auth/google", function (res) {
          assert.equal(res.statusCode, 404);
          done();
      });
  });

  xit("should return something on post of google strategy", function (done) {

    console.log(typeof nock.load);

    var nocks = nock.load('test/fixtures/google.json');

    http.post("http://localhost:8100/auth/google",
    {
      code: '4/r2SHUKHwsXND1KO9IvSj7M2SiV5BOrOtsnEaX-d8-j4',
      redirect_uri: 'http://localhost:8100',
      client_id:"407408718192.apps.googleusercontent.com&client_secret=************",
      scope:'',
      grant_type: "authorization_code"
    },
    function (res) {
      assert.equal(res.statusCode, 202);
      assert(nocks.isDone());
      done();
    });
  });
//


//
});

