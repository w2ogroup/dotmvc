var Resolver = require('./Resolver.js');

module.exports = Facade;

/**
 * Allow a static API into a IoC container resolved instance.
 * @constructor
 * @param {Resolver} resolver
 * @param {String=} name
 */
function Facade()
{
  throw new Error('Cannot instantiate Facade');
}

/**
 * The dependency resolver.
 * @type {Resolver}
 */
Facade.resolver = null;

/**
 * @return {Object} The instance as it is resolved out of the IoC container.
 */
Facade.getInstance = function()
{
  if (this.override) return this.override;
  var name = this.getFacadeAccessor();
  if (!name) return null;
  return this.resolver.make(name);
};

/**
 * Swap in a different instance into the facade
 */
Facade.swap = function(instance)
{
  this.override = instance;
  this.map();
};

/**
 * @return {String} Name used to make the dependency for the underlying
 * instance of this facade.
 */
Facade.getFacadeAccessor = function()
{
  return '';
};

/**
 * Ensure that all methods from our underlying instance are staticly on this
 * facade.
 */
Facade.map = function()
{
  this.unmap();
  var instance = this.getInstance();
  if (!instance) return;

  for (var key in instance) {
    if (key.charAt(0) === '_') continue;
    var value = instance[key];
    if (!this[key])
      this._install(key, value);
  }
};

/**
 * Remove all static facade-ed methods.
 */
Facade.unmap = function()
{
  if (!this._props) this._props = [];
  for (var n = 0; n < this._props.length; n++) {
    var prop = this._props[n];
    delete this[prop];
  }
};

// Install a delayed-resolved value into the container
Facade._install = function(key, value)
{
  var instance = this.getInstance();
  this[key] = value instanceof Function ?
    value.bind(instance) :
    value;
  this._props.push(key);
};

