/*jslint node: true, unparam: true, vars: true, white: true*/
/*jshint curly: true, eqeqeq: true, immed: true, newcap: true, noarg: true, undef: true, unused: true, latedef: true, boss: true, eqnull: true, laxcomma: true, sub: true, node: true, mocha: true*/

/*
 * couchdb-cookie-auth
 * https://github.com/pauliprice/couchdb-cookie-auth
 *
 * Copyright (c) 2013 Pauli Price
 * Licensed under the MIT license.
 */

'use strict';

(function () {

//var couchdb_cookie_auth = require('../../lib/couchdb-cookie-auth.js'),
//    nock = require('nock');

    function mocks(nock) {
        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', "false")
          .reply(200, "true", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:24 GMT',
          'content-type': 'application/json',
          'content-length': '7',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, "false", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:24 GMT',
          'content-type': 'application/json',
          'content-length': '8',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/XXX')
          .reply(404, {"error":"not_found","reason":"unknown_config_value"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:24 GMT',
          'content-type': 'application/json',
          'content-length': '54',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(401, {"error":"unauthorized","reason":"You are not a server admin."}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '64',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, "false", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '8',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/allow_persistent_cookies', "true")
          .reply(200, "false", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '8',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/allow_persistent_cookies')
          .reply(200, "true", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '7',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/timeout')
          .reply(200, "600", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '6',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_users/org.couchdb.user%3Abeth', {"name":"beth","password":"secret","roles":[],"type":"user"})
          .reply(201, {"ok":true,"id":"org.couchdb.user:beth","rev":"1-4b458d4fab97736e8b9bd2e70d7867bd"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          location: 'http://104.236.41.70:80/_users/org.couchdb.user:beth',
          etag: '"1-4b458d4fab97736e8b9bd2e70d7867bd"',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '84',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Abeth')
          .query({"revs_info":"true"})
          .reply(200, {"_id":"org.couchdb.user:beth","_rev":"1-4b458d4fab97736e8b9bd2e70d7867bd","password_scheme":"pbkdf2","iterations":10,"name":"beth","roles":[],"type":"user","derived_key":"08770a79721721838f5ec1bac3d7b8a582828522","salt":"bb03ee9def1745aff0abdd4be801593c","_revs_info":[{"rev":"1-4b458d4fab97736e8b9bd2e70d7867bd","status":"available"}]}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '338',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/secret', "92de07df7e7a3fe14808cef90a7cc0d91")
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '36',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/secret')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Mon, 14 Sep 2015 05:19:25 GMT',
          'content-type': 'application/json',
          'content-length': '36',
          'cache-control': 'must-revalidate' });

    }

    module.exports = mocks;

}());

