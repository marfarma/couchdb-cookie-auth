# couchdb-cookie-auth

Generate authentication cookie for domain - creates an logged on session with a same-domain couchdb server, i.e. if my couchdb is on http://couchdb.example.com, and my node server is at https://auth.example.com, I can create a cookie on my node server with domain='.example.com' and it will work with my couchdb server.

## Getting Started
Install the module with: `npm install couchdb-cookie-auth` (This won't work yet.  It's not published on npm.)

```javascript
var couchdb_cookie_auth = require('couchdb-cookie-auth');
couchdb_cookie_auth.getCookie(user, vhost); // "assumes you've already authenticated the user and just need a cookie"
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Pauli Price  
Licensed under the MIT license.
