module.exports = Router;

var Backbone = require('backbone');
var _        = require('underscore');
var $        = require('jquery');
var debug    = require('debug')('dotmvc:Router');

// jquery shim
Backbone.$ = $;

// A super-powered Backbone router that lets use use controllers as the
// primary means of establishing routes and behavior
function Router(application)
{
  if (!application)
    throw 'Router object must be instantiated with an application reference';
  global.router = this._router     = new Backbone.Router();
  this._controller = null;
  this._started    = false;
  this._app        = application;
}

// All routes must be set before hand!
Router.prototype.start = function()
{
  if (this._started)
    throw 'Cannot start the router more than once.';

  Backbone.history.start({ pushState: true });
  this._started = true;
};

// Parse a url as if we were landing there. Set opts.noHistory to true to
// prevent the entry from hitting the history
Router.prototype.navigateToUrl = function(url, opts)
{
  this._router.navigate(url, {
    trigger: true,
    replace: opts && opts.noHistory
  });
};

Router.prototype.route = function(TController, method)
{
  var params = [].slice.call(arguments, 2) || [];
  this._executeRoute.apply(this,
    [TController, method, 'INTERNAL'].concat(params));
};

// Setup all the routes for a controller using lots of MAGIC to build
// routes just from the class itself
Router.prototype.routeController = function(TController, name)
{
  var matches = TController.name.match(/^(.*)Controller$/);
  if (!matches)
    throw TController.name + ' is not a valid controller class name';

  // Convert camelCase into dash-case
  name = name === undefined ?
    matches[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() :
    name;

  // Default route always goes first
  this.addRoute(name + methodToRoute('index'), TController, 'index');

  // Add a route for all of the methods exposed on the controller that
  // aren't private (underscore prefix)
  var _this = this;
  _(TController.prototype).each(function(method, key) {

    if (!_(method).isFunction()) return;
    if (key[0] === '_') return;
    if (~['load', 'unload', 'index'].indexOf(key)) return;

    var route = name + '/' + key;

    // Add in the arguments via hacking the function to see what its
    // parameters are
    route += methodToRoute(method);

    _this.addRoute(route, TController, key);
  });
};

// Helper function to add on the optional route matches based on a
// functions parameters
function methodToRoute(method)
{
  var route = '';
  var args = method.toString().match(/function\s?\(([^\)]+)/);
  if (args) {
    args[1].replace(/[ ]*,[ ]*/, ',')
      .split(',')
      .map(function(s) { return s.trim(); })
      .forEach(function(a) {
        route += '(/:' + a + ')';
      });
  }

  route += '(/*rest)';
  return route;
}

// Given a backbone-compatible route, execute a specified function on a
// controller
Router.prototype.addRoute = function(route, TController, method)
{
  if (this._started)
    throw 'Cannot add routes after the router has been started';

  method = method || 'index';

  var sig = TController.name + '::' + method;
  if (!_(TController.prototype[method]).isFunction())
    throw 'Method not found on controller: ' + sig;

  debug('Added route: /' + route + ' -> ' + sig);
  this._router.route(route, route,
    this._executeRoute.bind(this, TController, method, route));
};

// Internal implementation of actaully executing a route -- this is where
// potential controller swapping / caching / state management semantics
// would occur, IF WE HAD ANY
Router.prototype._executeRoute = function(TController, method, route)
{
  // Args are provided as the fourth+ arguments, so extract them out
  var args = [].slice.call(arguments, 3);

  var sig = TController.name + '::' + method;
  if (route)
    debug('Matched route: ' + route);
  debug('Firing: ' + sig + '(' + args + ')');

  // If controller is already active, just call next route
  if (this._controller && this._controller.constructor !== TController) {
    debug(this._controller + ' unloading...');
    this._controller.unload();
    this._controller = null;
  }

  // Load new controller ?
  if (!this._controller) {
    var app = this._app;
    var controller = this._controller = new TController(app);
    app.window.setDataContext(controller);
    app.window.element.className = TController.name
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();

    controller.window = app.window;
    controller.load();
  }

  return this._controller[method].apply(this._controller, args);
};

