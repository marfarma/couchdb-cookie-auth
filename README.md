# couchdb-cookie-auth

Generate authentication cookie for domain - creates an logged on session for a couchdb server from your Node application.
Written to support authentication with third party providers (Google+, Facebook, etc.) from your Node application and automatically create a logged-in Couchdb session upon success.  This would allow, for example, a mobile device to authenticate via Google+ and immediately begin replication of a local database with a remote CouchDB server.  

Using your Node application to enable cookie authentication for your CouchDb server allows you to support user accounts without the need of a password (from the user's standpoint).  Your Node application can supply some arbitrary password generation scheme in order to create new accounts, and then proceed to ignore it's existance.

## Documentation

### API

#### couchdb_cookie_auth.makeCookie(user) [String]

Given a user name, it returns a serialized cookie (with options) suitable Set-Cookie assignment, i.e.:
    
```javascript
    var couchdb_cookie_auth = require('couchdb-cookie-auth');    
    var http = require('http');

    http.createServer(function (req, res) {        
        var content = 'some html content';
        res.setHeader('Set-Cookie', couchdb_cookie_auth.makeCookie(user));
        res.end(content);
    })
    .listen(8811);
```

#### couchdb_cookie_auth.validCookie(cookie) [Boolean]

Given the content of an 'AuthSession' cookie, returns true if it represents a valid Couchdb session.  The user name associated with the session is embedded within the cookie.
    
```javascript
    var couchdb_cookie_auth = require('couchdb-cookie-auth');    
    var http = require('http');

    var j = request.jar()
    request({url: 'http://www.google.com', jar: j}, function () {
      var cookie_string = j.getCookieString(url); // "key1=value1; key2=value2; ..."
      var cookies = j.getCookies(url);
      // [{key: 'key1', value: 'value1', domain: "www.google.com", ...}, ...]
      
      var cookie = cookies.filter(function(el) {
        return el.key === 'AuthSession';
      })
      
      if (cookie.length === 1) {
        if (couchdb_cookie_auth.validCookie(cookie[0].value)) {
            // cookie is valid couchdb session cookie, allow the request
        }
      }
    })
```

#### couchdb_cookie_auth.config.get('key') [void]

```javascript
    var couchdb_cookie_auth = require('couchdb-cookie-auth');
    
    var ssl = couchdb_cookie_auth.config.get('dbSsl');
```


#### couchdb_cookie_auth.config.set('key', value) [string]

```javascript
    var couchdb_cookie_auth = require('couchdb-cookie-auth');
    
    couchdb_cookie_auth.config.set('domain', 'example.com');
```

#### couchdb_cookie_auth.config.load(object)

This will load and merge a JavaScript object into config. E.g.:

```javascript
    couchdb_cookie_auth.config.load({
      "env": "test",
      "ip": "127.0.0.1",
      "port": 80
    });
```

#### couchdb_cookie_auth.config.loadFile(file or [file1, file2, ...])

This will load and merge one or multiple JSON configuration files into config.

```javascript
    couchdb_cookie_auth.conf.loadFile('./config/' + conf.get('env') + '.json');
```

You may also load multiple files at once:

```javascript
    // CONFIG_FILES=/path/to/production.json,/path/to/secrets.json,/path/to/sitespecific.json 
    couchdb_cookie_auth.config.loadFile(process.env.CONFIG_FILES.split(','));
```

### Config Settings

The Convict module (https://github.com/mozilla/node-convict) is used to manage settings.  Environment variables are respected and take precedence over values from the config file.  The config object is also exported, so config settings can be set from code.

The expected location and naming convention for the config file depends on the following code:

    config.loadFile('./config/' + config.get('env') + '.json');

Where the value of `env` defaults to 'development' but is overridden by the environment variable, `NODE_ENV`, if it exists.  The default location of the config file would be `./config/development.json`.  A sample couchdb_cookie_auth configuration file looks like this:

```json
    {
      "env": "development",
      "dbHost": "104.236.41.70",
      "domain": "example.com",
      "dbPort": "80",
      "dbUser":  "admin",
      "dbPass":  "admin_pw",
      "noHttps": false,
      "dbSsl": false
    }
```

For details of each available config setting, including supported environment variables, see the schema in the file `lib/config.js`


### Server Configuration

#### Hosting Domain Name Consideration

Your Node application and your CouchDb server need to reside on the same root domain (this is a basic http cookie feature).  Ideally, your CouchDB Server and your Node application can reside on different ports of the same domain.  If your Node application is at api.example.com, and your CouchDb server is at example.com:5984, you can specify the cookie domain as 'example.com' and the resulting authentication cookies will be valid.  

Attempting the inverse, however, can cause unexpected persistent sessions, leaving supposedly logged out users to remain logged in.  For example, given a CouchDB server at db.example.com and a Node application at example.com, if the session is logged out by the CouchDB server, it will send a blank AuthSession cookie with a domain value of 'db.example.com'  This cookie will not clear the AuthSession cookie with a domain of 'example.com' thereby leaving your user with a valid session cookie.

#### CouchDB Config Requirements

1. A server admin, i.e. a user with the roll `_admin` must exist.  The credentials for a user with the `_admin` role must be included in the config settings for the Node application (see config section above).

1. You must enable the `cookie_authentication_handler` in your local.ini  The tuple, `{couch_httpd_auth, cookie_authentication_handler}` must be present in the list of authentication handlers.  For example:

        [httpd]
        authentication_handlers = {couch_httpd_auth, cookie_authentication_handler}, {couch_httpd_oauth, oauth_authentication_handler}, {couch_httpd_auth, default_authentication_handler}

1. You must assign a server secret, for example:

        [couch_httpd_auth]
        secret = yours3cr37pr4s3
 
1. You may configure the number of seconds since the last request before sessions will be expired.

        [couch_httpd_auth]
        timeout = 600
    
1. You may makes cookies persistent by setting `allow_persistent_cookies` to true.  Most web browsers will delete your cookie when the browser exits.  If the cookie has a Max-Age or Expires property, the browser retains the cookie until the time specified by the Expires header.

        [couch_httpd_auth]
        allow_persistent_cookies = false    
    
1. You may specify a non-standard location for the CouchDB system users database.

        [couch_httpd_auth]
        authentication_db = _users 
    
## License
Copyright (c) 2013 Pauli Price  
Licensed under the MIT license.
