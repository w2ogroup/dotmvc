var _        = require('underscore');
var getArgs  = require('./util/get-args.js');

module.exports = Router;

/**
 * Register and dispatch URI-based routes to either closures or delegated
 * action handlers. Responses are then delegated to response handlers.
 * @constructor
 */
function Router()
{
  this._routes           = [];
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
  this._routes.forEach(function(r) {
    if (r.pattern === pattern)
      throw 'Duplicate pattern: "' + pattern + '"';
  });

  var regex = Router.compilePattern(pattern);

  var route = {
    pattern: regex,
    action: action
  };

  this._routes.push(route);
  return route;
};

/**
 * Get the response for a given route
 */
Router.prototype.dispatch = function(uri)
{
  var _this = this;
  var response;
  _(this._routes).find(function(route) {
    var match;

    if ((match = route.pattern.exec(uri))) {
      var args = match.slice(1);
      response = _this._executeRoute(route, args);
    }

    return response;
  });

  return response;
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

  if (action instanceof Function) {
    response = route.action.apply(null, args);
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

/**
 * Given a string route pattern, build a nice regex that'll give us the
 * arguments out of it.
 * @param {String} pattern Route pattern string.
 * @return {RegExp} A regular expression object for this route pattern.
 */
Router.compilePattern = function(pattern)
{
  var regex = '^\/?';

  var p = pattern
    // Okay to have leading slash
    .replace(/^\//, '')

    // Optional rest params
    .replace(/\/{[^\.}?]+\.\.\.\?}/g, '/?(.+)?')

    // Rest params
    .replace(/\/{[^\.}?]+\.\.\.}/g, '/(.+)')

    // optional params
    .replace(/\/{([^\?}]+)\?}/g, '/?([^/]+)?')

    // definite params
    .replace(/\/{([^}]+)}/g, '/([^/]+)');


  regex += p + '/?$';

  return new RegExp(regex);
};
