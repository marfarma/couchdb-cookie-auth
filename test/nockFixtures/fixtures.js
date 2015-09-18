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

    function mocks(nock) {

        //nock.recorder.rec();

        nock('http://104.236.41.70:80')
          .put('/alt_users')
          .reply(201, {"ok":true}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          location: 'http://104.236.41.70:80/alt_users',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '12',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });

        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .query({"revs_info":"true"})
          .reply(200, {"_id":"org.couchdb.user:patricia","_rev":"1-87ff3a81804fd25a39ff7d9829152a38","password_scheme":"pbkdf2","iterations":10,"name":"patricia","roles":[],"type":"user","derived_key":"c03bdc62fb0e1784ddced884f45a8f061631a232","salt":"382f6f369e0470ff0ac657a5b5e0f4c0","_revs_info":[{"rev":"1-87ff3a81804fd25a39ff7d9829152a38","status":"available"}]});

        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"alt_users"')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });

        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "alt_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '12',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_users/org.couchdb.user%3Apatricia', {"name":"patricia","password":"secret","roles":[],"type":"user"})
          .reply(201, {"ok":true,"id":"org.couchdb.user:patricia","rev":"1-e4b4385891bc9dcee7a598ede68455d6"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          location: 'http://104.236.41.70:80/_users/org.couchdb.user:patricia',
          etag: '"1-e4b4385891bc9dcee7a598ede68455d6"',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '88',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_users/org.couchdb.user%3Apatricia', {"name":"patricia","password":"secret","roles":[],"type":"user"})
          .reply(201, {"ok":true,"id":"org.couchdb.user:patricia","rev":"1-e4b4385891bc9dcee7a598ede68455d6"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          location: 'http://104.236.41.70:80/_users/org.couchdb.user:patricia',
          etag: '"1-e4b4385891bc9dcee7a598ede68455d6"',
          date: 'Fri, 18 Sep 2015 03:15:00 GMT',
          'content-type': 'application/json',
          'content-length': '88',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/alt_users/org.couchdb.user%3Apatricia')
          .query({"revs_info":"true"})
          .reply(404, {"error":"not_found","reason":"missing"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "alt_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '12',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(200, {"_id":"org.couchdb.user:patricia","_rev":"1-e4b4385891bc9dcee7a598ede68455d6","password_scheme":"pbkdf2","iterations":10,"name":"patricia","roles":[],"type":"user","derived_key":"3fadbf10bb91b26b64259b10d4a821751b8a24f8","salt":"d0d88abb561e0785aed4bfc5666b8c3f"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          etag: '"1-e4b4385891bc9dcee7a598ede68455d6"',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '265',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(200, {"_id":"org.couchdb.user:patricia","_rev":"1-e4b4385891bc9dcee7a598ede68455d6","password_scheme":"pbkdf2","iterations":10,"name":"patricia","roles":[],"type":"user","derived_key":"3fadbf10bb91b26b64259b10d4a821751b8a24f8","salt":"d0d88abb561e0785aed4bfc5666b8c3f"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          etag: '"1-e4b4385891bc9dcee7a598ede68455d6"',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '265',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Ainvalid%20user')
          .query({"revs_info":"true"})
          .reply(404, {"error":"not_found","reason":"missing"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .delete('/_users/org.couchdb.user%3Apatricia')
          .query({"rev":"1-e4b4385891bc9dcee7a598ede68455d6"})
          .reply(200, {"ok":true,"id":"org.couchdb.user:patricia","rev":"2-b353140b205999191ac80d9ac680bbbf"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          etag: '"2-b353140b205999191ac80d9ac680bbbf"',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '88',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/secret', '"92de07df7e7a3fe14808cef90a7cc0d91"')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:01 GMT',
          'content-type': 'application/json',
          'content-length': '36',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/secret')
          .reply(200, "92de07df7e7a3fe14808cef90a7cc0d91", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '36',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });




        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(404, {"error":"not_found","reason":"deleted"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '41',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });



        nock('http://104.236.41.70:80')
          .put('/_users/org.couchdb.user%3Apatricia', {"name":"patricia","password":"secret","roles":[],"type":"user"})
          .reply(201, {"ok":true,"id":"org.couchdb.user:patricia","rev":"1-3779f5e49115e8d5e75149d0a88429d1"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          location: 'http://104.236.41.70:80/_users/org.couchdb.user:patricia',
          etag: '"1-3779f5e49115e8d5e75149d0a88429d1"',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '88',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_config/couch_httpd_auth/authentication_db')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .delete('/alt_users')
          .reply(200, {"ok":true}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '12',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .get('/_users/org.couchdb.user%3Apatricia')
          .reply(200, {"_id":"org.couchdb.user:patricia","_rev":"1-3779f5e49115e8d5e75149d0a88429d1","password_scheme":"pbkdf2","iterations":10,"name":"patricia","roles":[],"type":"user","derived_key":"02b9a716a78734a7f3d5f9636381f1672d3572d3","salt":"e4fbf3ad781074869f9facc537e8f576"}, { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          etag: '"1-3779f5e49115e8d5e75149d0a88429d1"',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '265',
          'cache-control': 'must-revalidate' });


        nock('http://104.236.41.70:80')
          .put('/_config/couch_httpd_auth/authentication_db', '"_users"')
          .reply(200, "_users", { server: 'CouchDB/1.6.1 (Erlang OTP/17)',
          date: 'Fri, 18 Sep 2015 03:15:02 GMT',
          'content-type': 'application/json',
          'content-length': '9',
          'cache-control': 'must-revalidate' });


        return nock;
    }

    module.exports = {
      mocks: mocks
    };


}());

