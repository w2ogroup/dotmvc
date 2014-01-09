var _        = require('underscore');
var getArgs  = require('./util/get-args.js');
var Route    = require('./Route.js');
var Resolver = require('./Resolver.js');

module.exports = Router;

/**
 * Register and dispatch URI-based routes to either closures or delegated
 * action handlers. Responses are then delegated to response handlers.
 * @param {Resolver} resolver
 * @constructor
 */
function Router(resolver)
{
  /** @type {Array.<Route>} */
  this.routes           = [];

  /** @type {Resolver} */
  this.resolver = resolver;

  this._handlers = [];
}

/**
 * Bind a route pattern that executes a closure on dispatch.
 * @param {String} pattern The string pattern we want to bind to.
 * @param {*} action This is what we want to do when a route is matched. This
 * could be a closure or a more complicated structure if we want to delegate to
 * an action handler.
 */
Router.prototype.createRoute = function(pattern, action)
{
  // ensure we don't have something for this already
  this.routes.forEach(function(r) {
    if (r.pattern === pattern)
      throw new Error('Duplicate pattern: "' + pattern + '"');
  });

  var route = new Route(pattern, action);

  this.routes.push(route);
  return route;
};

Router.EMPTY_RESPONSE = {};

/**
 * Fire off an action based on a URI and return the response.
 * @param {String} uri
 */
Router.prototype.dispatch = function(uri)
{
  var _this = this;
  var response;
  _(this.routes).find(function(route) {
    var match;

    // Getting args back means we have a match
    if ((args = route.getParamsFromUri(uri))) {

      // Map parameters from the route into args provided from URI
      args = route.getParameterList().map(function(p) {
        return args[p];
      });

      response = _this._executeRoute(route, args);
    }

    return response;
  });

  return response;
};

/**
 * Given a named route and some arguments, return the URL required to make this
 * happen.
 * @param {String} routeName
 * @param {Object} args Hash of parameters to value.
 */
Router.prototype.getUrl = function(routeName, args)
{
  /** @type {Route} */
  var route = _(this.routes).find(function(route) {
    return route.name === routeName;
  });

  if (!route) return null;
  return route.getUriFromParams(args);
};

/**
 * Add in a type (or dependency) that can respond to actions that are
 * dispatched and handle their responses
 * @param {Object|String} handler Either an object with handler functions or
 * string dep
 */
Router.prototype.addHandler = function(handler)
{
  this._handlers.push(handler);
  this._handlers = _(this._handlers).uniq();
};

/**
 * Find a handler that will execute a specific.
 * @param {Object} action The action we want to execute
 * @param {Array.<String>} args Arguments we want to pass the action
 * @param {Array.<Object>} deps Dependencies we want to pass the action
 */
Router.prototype.executeAction = function(action, args, deps)
{
  var response;

  // Iterate over all handlers and see if any of them are willing to handle
  // this action. It's handled if passing in the action returns back a truthy
  // valut.
  var resolver = this.resolver;
  _(this._handlers).find(function(h) {
    if (_(h).isString())
      h = resolver.make(h);
    if (!(h.onAction instanceof Function)) return;
    response = h.onAction(action, args, deps);
    return response;
  });

  this.handleResponse(response);

  return response;
};

/**
 * Find a handler that is willing to handle a response.
 * @param {Object} response
 */
Router.prototype.handleResponse = function(response)
{
  if (!response) return;

  // Check all handlers for onResponse implementations. We're done as soon as
  // one of them returns a truthy value.
  var resolver = this.resolver;
  _(this._handlers).find(function(h) {
    if (_(h).isString())
      h = resolver.make(h);
    if (!(h.onResponse instanceof Function)) return;
    return h.onResponse(response);
  });
};

// Call closures directly, or trry our action handlers until we get a truthy
// response, and then pipe the output to our response handler
Router.prototype._executeRoute = function(route, args)
{
  var _this = this;
  var action = route.action;
  var response;

  // Resolve deps into an array
  var deps = route.dependencies.map(function(d) {
    return _this.resolver.make(d);
  });

  // Just call a closure straightup with the arguments and dependencies all
  // smashed together, then manually run the response checker post
  if (action instanceof Function) {
    response = route.action.apply(null, args.concat(deps));
    this.handleResponse(response);

  // Iterate over handlers until one of them gives us a response for onAction
  // (if any)
  } else {
    response = this.executeAction(route.action, args, deps);
  }

  return response;
};

