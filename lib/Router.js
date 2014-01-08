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

  this._actionHandlers   = [];
  this._responseHandlers = [];
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
 * Add an object that can have have executeAction() called.
 * @param {{executeAction: function(route:String, args:Array.<String>): boolean}} handler
 */
Router.prototype.addActionHandler = function(handler)
{
  if (!handler.executeAction)
    throw 'Action handler must have executeAction() method';

  this._actionHandlers.push(handler);
};

/**
 * Add an object that can have have handleResponse() called.
 * @param {{handleResponse: function(response:Object): boolean}} handler
 */
Router.prototype.addResponseHandler = function(handler)
{
  if (!handler.handleResponse)
    throw 'Response handler must have handleResponse() method';

  this._responseHandlers.push(handler);
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

  if (action instanceof Function) {
    // Add deps onto end of arg list + resolved deps
    response = route.action.apply(null, args.concat(deps));
  } else {
    _(this._actionHandlers).find(function(h) {
      response = h.executeAction(route, args);
      return response;
    });
  }

  if (response)
    this._handleResponse(response);

  return response;
};

// Try all of our response handlers until we get a truthy return
Router.prototype._handleResponse = function(response)
{
  _(this._responseHandlers).find(function(h) {
    return h.handleResponse(response);
  });
};
