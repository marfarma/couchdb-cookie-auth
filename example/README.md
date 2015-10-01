##How to configure the example.

###Ionic App

With your commandline rooted in the ionic app directory,

    bower install
    npm install
    ionic platform add ios
    ionic build
    ionic emulate ios

The app can only be tested in the IOS simulator.  Remote authentication will not work with te `ionic serve` server.

###Node Server

With another commadline rooted in the node server directory, start the server.

    node api.js

It will start the server on port 3000, and the ionic app expects to find it at localhost:3000


###CouchDB Server

Edit your /etc/hosts file and add the name devcdb pointing at the ip address of your couchdb server.

