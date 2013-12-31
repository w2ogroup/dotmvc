var Router   = require('./Router.js');
var Resolver = require('./Resolver.js');

module.exports = ControllerManager;

/**
 * Class responsible for instantiating, loading, unloading, and calling action
 * on controller objects. Acts as an action handler for the router. Is aware of
 * the resolver as it creates the controllers via the IoC container.
 * @param {Router} router Injected router.
 * @param {Resolver} resolver IoC container.
 * @constructor
 */
function ControllerManager(resolver)
{
  this.resolver = resolver;

  /**
   * Requeste a router object from the IoC container, should be there...
   * @type {Router}
   */
  this.router = resolver.make('router');

  this._currentController = null;

  // Register ourselves with the router so we can receive actions
  this.router.addActionHandler(this);
}

var MISSING_METHOD = '_missingMethod';

ControllerManager.prototype.registerController = function(name, TController)
{
  name += '/{args...?}';
  return this.router.createRoute(name, { T: TController });
};

// For a given controller, let's do something with it.
ControllerManager.prototype.executeAction = function(route, args)
{
  // Our controller comes through on the action we set when registered, the
  // rest params is everything after the prefix
  var T = route.action.T;
  var rest = args[0] || '';

  var methodName = !rest ? 'index' : rest.match(/^[^/]*/)[0];
  methodName += 'Action';
  this._callControllerMethod(T, methodName);
};

ControllerManager.prototype._callControllerMethod = function(T, methodName)
{
  var current = this._currentController;

  // New controller type?
  if (!(current instanceof T)) {
    if (current && current.unload instanceof Function)
      current.unload();
    this._currentController = current = this.resolver.makeFromConstructor(T);
  }

  // See if we have this method
  if (current[methodName] instanceof Function) {
    current[methodName]();
  } else if (current[MISSING_METHOD] instanceof Function) {
    current[MISSING_METHOD]();
  }
};

