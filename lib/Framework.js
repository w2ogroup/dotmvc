var Resolver          = require('./Resolver.js');
var Router            = require('./Router.js');
var ControllerManager = require('./ControllerManager.js');

module.exports = Framework;

/**
 * Facade class that is used to manage the application.
 * @constructor
 */
function Framework()
{
  // Stuff aware of the IoC container. These are the modules that are
  // highly-coupled to the framework architecture
  this._resolver    = new Resolver();
  this._controllers = new ControllerManager(this._resolver);
}

/**
 * Register a type into the IoC container.
 * @param {String} abstract Depedency name.
 * @param {Function} T Dependency constructor function.
 */
Framework.prototype.register = function(abstract, T)
{
  return this._resolver.register(abstract, T);
};

/**
 * Bind a URI route pattern to a closure.
 * @param {String} pattern URI pattern.
 * @param {function(): Object} closure Handler function that returns the response.
 */
Framework.prototype.route = function(pattern, closure)
{
  return this.getRouter().createRoute(pattern, closure);
};

/**
 * Bind a URI route prefix to a Controller class.
 * @param {String} prefix URI prefix.
 * @param {Function} TController Controller constructor function.
 */
Framework.prototype.controller = function(prefix, TController)
{
  if (!TController) {
    TController = prefix;
    var match = TController.name.match(/^(.*)Controller$/);
    if (!match) throw 'missing arguments';
    prefix = match[1].toLowerCase();
  }

  this.getRouter();
  return this._controllers.registerController(prefix, TController);
};

/**
 * Defer loading of router in case of late binding
 * @return {Router}
 */
Framework.prototype.getRouter = function()
{
  if (!this._resolver.isRegistered('router'))
    this._resolver.singleton('router', Router);

  return this._resolver.make('router');
};

/**
 * Start the application.
 */
Framework.prototype.start = function()
{
};



