var __mixin    = require('../util/mixin.js');
var Facade     = require('../Facade.js');

module.exports = App;
__mixin(App, Facade);

/**
 * @constructor
 */
function App()
{

}

/**
 * Register a class constructor or closure into the container.
 * @param {String} name
 * @param {Function} T
 */
App.prototype.register = function(name, T)
{
  return this.getInstance().register(name, T);
};

/**
 * Register a shared class constructor or closure into the container.
 * @param {String} name
 * @param {Function} T
 */
App.prototype.shared = function(name, T)
{
  return this.getInstance().register(name, T, true);
};

App.getFacadeAccessor = function() { return 'resolver'; };



