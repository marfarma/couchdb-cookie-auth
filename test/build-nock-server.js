var nano = require('nano')('http://mypeople.iriscouch.com') 
var nock = require('nock'); // we require nock
var couchdb_cookie_auth = require('../lib/couchdb-cookie-auth.js');
var should = require('should');
var db   = nano.use('_config');

GET
/_config/section/key
Returns a single configuration value from given section in server configuration

PUT
/_config/section/key
Set a single configuration value in a given section to server configuration

DELETE
/_config/section/key
Delete a single configuration value from a given section in server configuration

roles.contains.element("_admin") ==> server admin role

var xhr = CouchDB.request("PUT", CouchDB.protocol + host + "/_config/couch_httpd_auth/require_valid_user", {
        headers: {
          "Authorization": adminBasicAuthHeaderValue(),
          "X-Couch-Persist": "false"
        },
        body: JSON.stringify("true")
      });
      
      run_on_modified_server(
          [
           {section: "couch_httpd_auth",
            key: "secret", value: generateSecret(64)},
           {section: "couch_httpd_auth",
            key: "authentication_db", value: "test_suite_users"},
          ],
          testFun
        );      


        GET
        /_session
        Returns cookie based login user information
        Session

        POST
        /_session
        Do cookie based user login
        Session

        DELETE
        /_session
        Logout cookie based user
        Session
        
        
        GET
        /db/_design/design-doc
        Returns the latest revision of the design document
        
        PUT
        /db/_design/design-doc
        Inserts a new version of the design document

        DELETE
        /db/_design/design-doc
        Deletes the design document

        COPY
        /db/_design/design-doc
        Copies the design document

        GET
        /db/_design/design-doc/attachment
        Gets an attachment of the design document

        PUT
        /db/_design/design-doc/attachment
        Inserts an attachment to the design document

        DELETE
        /db/_design/design-doc/attachment
        Deletes an attachment from the design document

        GET
        /db/_design/design-doc/_info
        Returns information about the design document
        View Info
        {
            "name": "test",
            "view_index": {
                "compact_running": false,
                "disk_size": 4188,
                "language": "javascript",
                "purge_seq": 0,
                "signature": "07ca32cf9b0de9c915c5d9ce653cdca3",
                "update_seq": 4,
                "updater_running": false,
                "waiting_clients": 0,
                "waiting_commit": false
            }
        }
        
        
        
        
        GET http://couchdb:5984/_config
        Accept: application/json
        The response is the JSON structure:

        {
           "query_server_config" : {
              "reduce_limit" : "true"
           },
           "couchdb" : {
              "os_process_timeout" : "5000",
              "max_attachment_chunk_size" : "4294967296",
              "max_document_size" : "4294967296",
              "uri_file" : "/var/lib/couchdb/couch.uri",
              "max_dbs_open" : "100",
              "view_index_dir" : "/var/lib/couchdb",
              "util_driver_dir" : "/usr/lib64/couchdb/erlang/lib/couch-1.0.1/priv/lib",
              "database_dir" : "/var/lib/couchdb",
              "delayed_commits" : "true"
           },
           "attachments" : {
              "compressible_types" : "text/*, application/javascript, application/json,  application/xml",
              "compression_level" : "8"
           },
           "uuids" : {
              "algorithm" : "utc_random"
           },
           "daemons" : {
              "view_manager" : "{couch_view, start_link, []}",
              "auth_cache" : "{couch_auth_cache, start_link, []}",
              "uuids" : "{couch_uuids, start, []}",
              "stats_aggregator" : "{couch_stats_aggregator, start, []}",
              "query_servers" : "{couch_query_servers, start_link, []}",
              "httpd" : "{couch_httpd, start_link, []}",
              "stats_collector" : "{couch_stats_collector, start, []}",
              "db_update_notifier" : "{couch_db_update_notifier_sup, start_link, []}",
              "external_manager" : "{couch_external_manager, start_link, []}"
           },
           "stats" : {
              "samples" : "[0, 60, 300, 900]",
              "rate" : "1000"
           },
           "httpd" : {
              "vhost_global_handlers" : "_utils, _uuids, _session, _oauth, _users",
              "secure_rewrites" : "true",
              "authentication_handlers" : "{couch_httpd_oauth, oauth_authentication_handler},
                                           {couch_httpd_auth, cookie_authentication_handler},
                                           {couch_httpd_auth, default_authentication_handler}",
              "port" : "5984",
              "default_handler" : "{couch_httpd_db, handle_request}",
              "allow_jsonp" : "false",
              "bind_address" : "192.168.0.2",
              "max_connections" : "2048"
           },
           "query_servers" : {
              "javascript" : "/usr/bin/couchjs /usr/share/couchdb/server/main.js"
           },
           "couch_httpd_auth" : {
              "authentication_db" : "_users",
              "require_valid_user" : "false",
              "authentication_redirect" : "/_utils/session.html",
              "timeout" : "600",
              "auth_cache_size" : "50"
           },
           "httpd_db_handlers" : {
              "_design" : "{couch_httpd_db, handle_design_req}",
              "_compact" : "{couch_httpd_db, handle_compact_req}",
              "_view_cleanup" : "{couch_httpd_db, handle_view_cleanup_req}",
              "_temp_view" : "{couch_httpd_view, handle_temp_view_req}",
              "_changes" : "{couch_httpd_db, handle_changes_req}"
           },
           "replicator" : {
              "max_http_sessions" : "10",
              "max_http_pipeline_size" : "10"
           },
           "log" : {
              "include_sasl" : "true",
              "level" : "info",
              "file" : "/var/log/couchdb/couch.log"
           },
           "httpd_design_handlers" : {
              "_update" : "{couch_httpd_show, handle_doc_update_req}",
              "_show" : "{couch_httpd_show, handle_doc_show_req}",
              "_info" : "{couch_httpd_db,   handle_design_info_req}",
              "_list" : "{couch_httpd_show, handle_view_list_req}",
              "_view" : "{couch_httpd_view, handle_view_req}",
              "_rewrite" : "{couch_httpd_rewrite, handle_rewrite_req}"
           },
           "httpd_global_handlers" : {
              "_replicate" : "{couch_httpd_misc_handlers, handle_replicate_req}",
              "/" : "{couch_httpd_misc_handlers, handle_welcome_req, <<\"Welcome\">>}",
              "_config" : "{couch_httpd_misc_handlers, handle_config_req}",
              "_utils" : "{couch_httpd_misc_handlers, handle_utils_dir_req, \"/usr/share/couchdb/www\"}",
              "_active_tasks" : "{couch_httpd_misc_handlers, handle_task_status_req}",
              "_session" : "{couch_httpd_auth, handle_session_req}",
              "_log" : "{couch_httpd_misc_handlers, handle_log_req}",
              "favicon.ico" : "{couch_httpd_misc_handlers, handle_favicon_req, \"/usr/share/couchdb/www\"}",
              "_all_dbs" : "{couch_httpd_misc_handlers, handle_all_dbs_req}",
              "_oauth" : "{couch_httpd_oauth, handle_oauth_req}",
              "_restart" : "{couch_httpd_misc_handlers, handle_restart_req}",
              "_uuids" : "{couch_httpd_misc_handlers, handle_uuids_req}",
              "_stats" : "{couch_httpd_stats_handlers, handle_stats_req}"
           }
        }
        
        
        GET http://couchdb:5984/_config/log/level
        Accept: application/json
        Returns the string of the log level:

        "info"
        
        
        
        
        function createQuotesView(err) {
        errorHandler(err);
        db.save('_design/quotes', {
        views: { byAuthor: { map: 'function (doc) { emit(doc.author, doc)
        }'}}
        }, outputQuotes);
        }
        
        
        function outputQuotes(err) {
        errorHandler(err);
        if (params.author) {
        db.view('quotes/byAuthor', {key: params.author},
        function (err, rowsArray) {
        if (err && err.error === "not_found") {
        createQuotesView();
        return;
        }
        errorHandler(err);
        rowsArray.forEach(function (doc) {
        console.log('%s: %s \n', doc.author, doc.quote); return;
        });
        });
        }
        }