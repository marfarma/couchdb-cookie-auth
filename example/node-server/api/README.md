// commandline to start mongodb server from terminal
// mongod --config /usr/local/etc/mongod.conf

//I’ve also been frustrated by 3rd party hosting. Iriscouch is unreliable. Smilleupps has a terrible user interface. Cloudant is expensive overkill. Then I realized that deploying couchdb in the cloud is unlike a lot of other server side deployments. All you need is CouchDB. No other web server, no installation of a database, or rails stack or anything. If you get an empty DigitalOcean CoreOS server for $5 a month, then install a docker image of couchdb, you are done. I think this is the reason 3rd party hosting is kind of crappy – there’s not much value to be added, since so much is in bog standard couchdb.
//
//ssh core@yourdigitaloceanserver
//docker pull klaemo/couchdb
//docker run -d -p 80:5984 –name couchdb klaemo/couchdb
