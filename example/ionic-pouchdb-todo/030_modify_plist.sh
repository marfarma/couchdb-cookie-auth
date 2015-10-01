#!/bin/bash

PLIST=platforms/ios/*/*-Info.plist

cat << EOF |
Add :NSAppTransportSecurity dict
Add :NSAppTransportSecurity:NSExceptionDomains dict
Add :NSAppTransportSecurity:NSExceptionDomains:example.com dict
Add :NSAppTransportSecurity:NSExceptionDomains:example.com:NSIncludesSubdomains bool YES
Add :NSAppTransportSecurity:NSExceptionDomains:localhost:NSExceptionAllowsInsecureHTTPLoads bool YES
EOF
while read line
do
    /usr/libexec/PlistBuddy -c "$line" $PLIST
done

true
