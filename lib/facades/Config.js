var __mixin    = require('../util/mixin.js');
var Facade     = require('../Facade.js');

module.exports = Config;
__mixin(Config, Facade);

/**
 * @constructor
 */
function Config()
{

}

/**
 * Set a key/value pair or merge in an hash of properties
 * @param {String|Object} key
 * @param {*=} value
 * @return {*}
 * @example
 * var Config = require('dotmvc').Config;
 *
 * Config.set('app.name', 'Something Awesome');
 * Config.set({ app: { version: '1.0.0' }});
 */
Config.set = function(key, value)
{
  var instance = this.getInstance();

  if (typeof key === 'object')
    return instance.merge(key);
  else
    return instance.set(key, value);
};

Config.getFacadeAccessor = function() { return 'config'; };



