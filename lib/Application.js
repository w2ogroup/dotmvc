var Router     = require('./Router.js');
var log        = require('./util/log.js');
var Observable = require('./Observable.js');
var __mixin    = require('./util/mixin.js');
var View       = require('./View.js');

module.exports = (function() {
  __mixin(Application, Observable);

  // Central application class. The root of the application heirarchy. The
  // main() and start() methods are where any application setup action should
  // occur. The DOM <html> node is databound to the singleton instance, meaning
  // we can put commands in the Application instance that can handle
  // cross-cutting concerns that bubble up from lower controllers/views
  function Application()
  {
    this.router = new Router(this);
    _instance = this;
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
    this.window = new View(document.body, 'window');

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

  return Application;

})();
