#!/bin/sh
#Senv

INFOPLIST_FILE="platforms/ios/*/*-Info.plist"

# Remove exception for all builds
/usr/libexec/PlistBuddy -c "Delete :NSAppTransportSecurity" ${INFOPLIST_FILE} 2>/dev/null
exitCode=$? #Supresses failure if key doesn't exist

# Add exception for Debug builds
#if [ "${CONFIGURATION}" == "Debug" ]
#then


/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity dict" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSAllowsArbitraryLoads bool true" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:db.taciko.com dict" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:db.taciko.com:NSIncludesSubdomains bool true" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:db.taciko.com:NSExceptionAllowsInsecureHTTPLoads bool true" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:localhost dict" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:localhost:NSIncludesSubdomains bool true" ${INFOPLIST_FILE}
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSExceptionDomains:localhost:NSExceptionAllowsInsecureHTTPLoads bool true" ${INFOPLIST_FILE}
#fi

true

