ionic-pouchdb-todo
==========================

This is an older example of the use of [ng-pouchdb](https://github.com/danielzen/ng-pouchdb).

Please see the latest example of this library in use at http://github.com/danielzen/todo-ng-pouchdb

This is a 4-way data-binding library, in action using a simple Ionic Todo app with a PouchDb local storage backend configured to sync with a CouchDb installation. This is a demo of offline functionality with server synchronization. And is part of my Offline data synchronization talk.
 Slides available at: [http://zndg.tl/ng-pouchdb](http://zndg.tl/ng-pouchdb)

You can watch me demo building an early version of the app at 
[FITC Spotlight: AngularJS](http://youtu.be/6ecuA-pOev0?t=14m9s) in Toronto.

This repository has multiple releases you can download or tags you can checkout to see the incremental building 
of the application. Only the final version using the ng-pouchdb library.

## Installation

You may need to install bower globally with `npm install -g bower` before running `bower install`, to download 
the necessary required frontend libraries. You may need to do a `npm -g install bower`, if you haven't already. 

## Run the App
 
You can `cd` into the `www` directory and run 

```bash
python -m SimpleHTTPServer 8000
```
If you're using Python 3.x or higher

```bash
python -m http.server 8000
```


You can then just open [http://localhost:8000/index.html](http://localhost:8000/index.html) in a browser.

Personally I use WebStorm which has a built in server. From a JetBrains product, you can select "View...", "Open in Browser" on index.html.

The final version of this demo requires you to [download and install CouchDb](http://couchdb.apache.org/#download), which runs on port 5984. And, [enable CORS](http://docs.couchdb.org/en/1.6.1/config/http.html#cross-origin-resource-sharing).

## iOS version

However, to run this as a mobile application in iOS emulator,
do the following to setup : 

```bash
$ cd ionic-pouchdb-todo
$ sudo npm install -g cordova ionic gulp
```
Add the following to your config.xml unless your development servers support https connections.
This presupposes that localhost is your backend api, and devcdb is your CouchDB host.  Note that raw ip addresses will not work.  Just edit your /etc/hosts file and name your dev machine.

```
    <config-file platform="ios" target="*-Info.plist" parent="NSAppTransportSecurity">
      <dict>
          <key>NSExceptionDomains</key>
          <dict>
              <key>devcdb</key>
              <dict>
                  <key>NSIncludesSubdomains</key><false/>
                  <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
              </dict>
              <key>localhost</key> 
              <dict>
                <key>NSIncludesSubdomains</key><true/>
                <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
              </dict>
          </dict>
      </dict>
     </config-file>
```



To run in the iPhone Simulator:

```bash
ionic platform add ios
ionic build ios
ionic emulate ios
```

## Building Out & Updating Ionic or PouchDb

To update to a new version of Ionic, open bower.json and change the version listed there.

For example, to update from version `1.0.0-beta.12` to `1.0.0-beta.13`, open bower.json and change this:

```
"ionic": "driftyco/ionic-bower#1.0.0-beta.12"
```

After saving the update to bower.json file, run `bower install`.

I was a little forward thinking adding  the `package.json` file.
To continue working on this repository, adding tests, using SASS, you can

```bash
$ npm install
$ gulp install
```
