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
 * @param {String|Object} key
 * @param {*=} value
 * @return {*}
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



