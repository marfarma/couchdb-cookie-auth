#!/usr/local/bin/bash
# bundle root, etc. certificates into pem
cat ssl-couch.crt root-startssl.pem \
intermediate-startssl.pem ssl-couch.key \
> ssl-couch-bundle.pem
