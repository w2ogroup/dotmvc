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
      throw 'Duplicate pattern: "' + pattern + '"';
  });

  var route = new Route(pattern, action);

  this.routes.push(route);
  return route;
};

Router.EMPTY_RESPONSE = {};

/**
 * Get the response for a given route
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

  // Just call a closure straightup
  if (action instanceof Function) {
    response = route.action.apply(null, args.concat(deps));

  // Iterate over handlers until one of them gives us a response for onAction
  // (if any)
  } else {
    _(this._handlers).find(function(h) {
      if (_(h).isString())
        h = _this.resolver.make(h);
      if (!(h.onAction instanceof Function)) return;
      response = h.onAction(route, args);
      return response;
    });
  }

  // If we got a response, iterate over
  if (response) {
    _(this._handlers).find(function(h) {
      if (_(h).isString())
        h = _this.resolver.make(h);
      if (!(h.onResponse instanceof Function)) return;
      return h.onResponse(response);
    });
  }

  return response;
};

