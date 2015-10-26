'use strict';
/*jshint mocha: true, node: true*/

var assert = require("chai").assert;
var http   = require("http");
var server = require("../api");
//var nock = require('nock');

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
  it("should return a 200 response on a valid set", function (done) {
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

  it("should return a 404 response on a get of google strategy", function (done) {
      http.post("http://localhost:8100/auth/google", function (res) {
          assert.equal(res.statusCode, 404);
          done();
      });
  });


  ///auth/google
//
});

