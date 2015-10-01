'use strict';

var bluebird = require('bluebird');
var smartdb = require('smartdb');
var _ = require('lodash');

const blacklist = new Set(['smartdb', 'fake', 'cacheProviders' ]);

/**
 * Promisifies the exposed functions on an object
 * Based on a similar function in `qano`
 *
 * @ref https://github.com/jclohmann/qano
 * as found in `node-blue`
 * @ref https://github.com/bdchauvette/nano-blue
 */
function deepPromisify(obj) {
  return _.transform(obj, function(promisifiedObj, value, key) {

    if (blacklist.has(key)) {
      promisifiedObj[key] = value;
      return;
    }

    if (typeof value === 'function') {
      promisifiedObj[key] = bluebird.promisify(value, obj);
    } else if (typeof value === 'object') {
      promisifiedObj[key] = deepPromisify(value);
    } else {
      promisifiedObj[key] = value;
    }
  });
}

module.exports = function smartdbBlue() {
  var smartdbP = deepPromisify(smartdb.apply(null, arguments));
  return smartdbP;
};
