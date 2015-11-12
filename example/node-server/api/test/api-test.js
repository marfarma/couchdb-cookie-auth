'use strict';
/*jshint mocha: true, node: true, -W030*/

//var querystring = require('querystring');
var chai = require("chai");
var should = chai.should(); //jshint ignore:line
chai.config.includeStack = true;
var assert = chai.assert;
//var http = require("http");
//http.post = require('http-post');
var needle = require('needle');
var server = require("../api");
var nock = require('nock');
//nocks = nocks.concat(nock.load('test/fixtures/localhost.json'));

describe('api server tests', function () {
  var app; //jshint ignore:line

  beforeEach(function() {
    nock.cleanAll();
//    console.log('nock.isActive: ', nock.isActive());
    nock.enableNetConnect();
    var nocks = nock.load('test/fixtures/google.json'); //jshint ignore:line
  });
  before(function (done) {
    app = server(function (err) {
      if (err) {
        console.log(err);
      }
      done();
    });
  });

  it("should return a 200 response on test route", function (done) {
    needle.get("http://localhost:8100/auth/test", function (err, res) {
//      console.log(res);
      if (err) {
        console.log('test route get result is err: ', err);
        assert.ok(false, 'should not receive error');
        done();
      } else {
        assert.equal(res.statusCode, 200);
        done();
      }
    });
  });

  it("should return a 404 response on a get of google strategy code", function (done) {
//    nock.cleanAll();
//    var nocks = nock.load('test/fixtures/no-get-for-auth.json');
//    console.log(nocks);
//    console.log(nocks[0].pendingMocks());
//    nock.recorder.clear();
//    nock.recorder.rec({
//      dont_print: true,
//      output_objects: true,
//      enable_reqheaders_recording: true
//    });
    needle.get("http://localhost:8100/auth/google", function (err, res) {
      if (err) {console.log(err); assert.fail('get request failed');}
//      assert(nocks.isDone());
      assert.equal(res.statusCode, 404);
      done();
    });
  });

  it.skip("should return something on post of google strategy code", function (done) {
//    nock.cleanAll();
//    if (!nock.isActive()) {nock.activate();}
    this.timeout(50000);
    var options = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*"
      },
      parse_response: false,
      json: true
    };

    var data = {
        code: '4/r2SHUKHwsXND1KO9IvSj7M2SiV5BOrOtsnEaX-d8-j4',
        redirectUri: 'http://localhost:8100',
        clientId: "630524341769-18r7lv3t75ius04f7f9na9b4a72bdq08.apps.googleusercontent.com"
      };

//    nock.recorder.clear();
//    nock.recorder.rec({
//      dont_print: true,
//      output_objects: true,
//      enable_reqheaders_recording: true
//    });
    needle.post('http://localhost:8100/auth/google', data, options, function (err, res) {
//      var nockCalls = nock.recorder.play();
//      console.log(JSON.stringify(nockCalls));
      if (err) {
        console.log('post result is err: ', err);
        assert.ok(false, 'should not receive error');
        done();
      } else {
        console.log('post result not err: ', res.body.toString());
        res.should.be.defined;
//        assert.not.equal(res, undefined);
//        assert(nocks.isDone());
        done();
      }
    });

  });

});
