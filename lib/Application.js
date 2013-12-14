var Router          = require('./Router.js');
var log             = require('./util/log.js');
var Observable      = require('./Observable.js');
var CommandProvider = require('./CommandProvider.js');
var __mixin         = require('./util/mixin.js');
var View            = require('./View.js');
var Window          = require('./Window.js');

module.exports = Application;
__mixin(Application, Observable);
__mixin(Application, CommandProvider);

// Central application class. The root of the application heirarchy. The
// main() and start() methods are where any application setup action should
// occur. The DOM <html> node is databound to the singleton instance, meaning
// we can put commands in the Application instance that can handle
// cross-cutting concerns that bubble up from lower controllers/views
function Application()
{
  _instance = this;
  this.router = new Router(this);

  this.registerCommand({ navigate: this.navigate });
}

// Application entry point
Application.prototype.main = function()
{
};

// Singleton
var _instance = null;
Application.getInstance = function() { return _instance; };

// Create the application frame views and start the router
Application.prototype.start = function()
{
  // Body DOM element is data-bound to our own shit. Each controller will
  // change the data context when it feel like
  var rootView = new View(document.documentElement, 'global');
  rootView.setDataContext(this);
  this.window = new Window(document.body);

  log('Application started. Routing initial URL...');
  this.router.start();
};

// Delegate routing to a URL to our navigate
Application.prototype.navigate = function(url)
{
  return this.router.navigateToUrl(url);
};

Application.prototype.toString = function()
{
  var s = '[Application';
  s += this.constructor !== Application ?
    '::' + this.constructor.name : '';
  s += ']';
  return s;
};
