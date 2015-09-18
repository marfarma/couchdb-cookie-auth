/*jslint node: true, unparam: true, vars: true, es5: true, white: true*/
/*jshint curly: true, eqeqeq: true, immed: true, es5: true, -W030, newcap: true, noarg: true, undef: true, unused: true, latedef: true, boss: true, eqnull: true, laxcomma: true, sub: true, node: true, mocha: true*/
'use strict';

(function () {

    var Promise = require("bluebird");

    var resetConfig = function(couchdb_cookie_auth){
        var env = couchdb_cookie_auth.config.get('env');
        var config = couchdb_cookie_auth.config;

        config.loadFile('./config/' + env + '.json');
        couchdb_cookie_auth.setUserPass(config.get('dbUser'), config.get('dbPass'));
    };

    function setServerConfig(server, section, key, value) {
        // _config/couch_httpd_auth/allow_persistent_cookies
        return server.request({
            method : 'PUT',
            path: '_config/' + section + '/' + key,
            body: value
        })
        .then(function(body) {
            return Promise.resolve([body]);
        })
        .catch(function(err) {
            return Promise.reject(err);
        });

    }

    module.exports = {
      resetConfig: resetConfig,
      setServerConfig: setServerConfig
    };

}());
