var Router   = require('../Router.js');
var Resolver = require('../Resolver.js');
var getArgs  = require('../util/get-args.js');

module.exports = ControllerManager;

/**
 * Class responsible for instantiating, loading, unloading, and calling action
 * on controller objects. Acts as an action handler for the router. Is aware of
 * the resolver as it creates the controllers via the IoC container.
 * @param {Resolver} resolver IoC container.
 * @constructor
 */
function ControllerManager(resolver)
{
  this.resolver = resolver;
  this._currentController = null;
  this._router = null;
}

var MISSING_METHOD = 'missingMethod';

function ControllerAction(T, methodName)
{
  this.T = T;
  this.methodName = methodName;
}

/**
 * Add a controller and setup routes for all actions we've got.
 * @param {String} prefix Route prefix we want to trigger this controller.
 * @param {Function} TController Constructor function for the controller we
 * want to register.
 */
ControllerManager.prototype.registerController = function(prefix, TController)
{
  // Create a fake ctor to instantiate in order to look at all its goodies
  function T() {}
  T.prototype = TController.prototype;
  var t = new T();

  // Create a routing for each method
  for (var key in t) {
    var method = t[key];
    if (!(method instanceof Function)) continue;
    var args = getArgs(method);
    var match = key.match(/^(.*)Action$/);
    if (!match) continue;
    var name = match[1] === 'index' ? '' : match[1];
    var pattern = prefix;
    if (pattern) pattern += '/';
    pattern += name;
    pattern += args.reduce(function(acc, a) {
      var opt = a.charAt(0) === '_';
      if (opt) a = a.substr(1);
      return acc + '/{' + a + (a === 'rest' ? '...' : '') + (opt ? '?' : '') + '}';
    }, '');
    pattern = pattern
      .replace(/\/\//g, '/')
      .replace(/^\//, '')
      .replace(/\/$/, '');
    this.getRouter().createRoute(pattern, new ControllerAction(TController, key));
  }

  // Add a catch all
  if (t[MISSING_METHOD] instanceof Function) {
    this.getRouter().createRoute(prefix + '/{rest...?}',
      new ControllerAction(TController, MISSING_METHOD));
  }
};

/**
 * @return {Router}
 */
ControllerManager.prototype.getRouter = function()
{
  if (!this._router) {
    this._router =  this.resolver.make('router');
    this._router.addActionHandler(this);
  }

  return this._router;
};

// For a given controller, let's do something with it.
ControllerManager.prototype.executeAction = function(route, args)
{
  if (!(route.action instanceof ControllerAction)) return;
  var action = route.action;
  return this._callControllerMethod(action.T, action.methodName, args) ||
    Router.EMPTY_RESPONSE;
};

/**
 * Lets us call a controller method, correctly loading / unloading controllers
 * if we need to on change, as well as using the IoC container to set them up.
 * @private
 * @param {Function} T Controller constructor.
 * @param {String} methodName Method we want to call.
 * @param {Array.<string>} args Arguments we want to pass the constructor
 * @return {Object} The response of the controller action call.
 */
ControllerManager.prototype._callControllerMethod = function(T, methodName, args)
{
  var current = this._currentController;

  // New controller type?
  if (!(current instanceof T)) {
    if (current && current.unload instanceof Function)
      current.unload();
    this._currentController = current = this.resolver.make(T);

    if (current.load instanceof Function)
      current.load();
  }

  // See if we have this method
  var response;
  if (current[methodName] instanceof Function) {
    response = current[methodName].apply(current, args);
  } else if (current[MISSING_METHOD] instanceof Function) {
    response = current[MISSING_METHOD].apply(current, args);
  }

  return response;
};
