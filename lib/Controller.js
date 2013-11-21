var __mixin    = require('./util/mixin.js');
var Observable = require('./Observable.js');
var Binding    = require('./Binding.js');

module.exports = (function() {
  __mixin(Controller, Observable);

  // Routing unit that is responsible for tying urls to behavior. Should be
  // extended in the form of "SomethingController", e.g. "AdminController",
  // which will automatically get all public methods wired up to the URL
  // router by the application
  function Controller()
  {
    // Injected by the router-- reference to the <body>-bound view
    this.window = null;

    if (this.constructor === Controller)
      throw 'Cannot instantiate Controller base class';
  }

  // Called whenever a route that points to this controller class is executed
  // for the first time. Will not be called in subsequent routes
  Controller.prototype.load = function()
  {

  };

  // Called whenever we are about to route to a controller that ISNT this
  // class. Gives us a chance to cleanup the DOM and any lingering events,
  // etc
  Controller.prototype.unload = function()
  {

  };

  // The default route that is called if no other things are matching. Will
  // trigger a 404 event in the app if not overridden
  Controller.prototype.index = function()
  {

  };

  // Given a map of 'jquery selector' -> TView constructor, instantiate the
  // view with the DOM set to the first match of the selector, and add it as a
  // property to this controller with the key of the constructor name,
  // lowercase. THe first parameter is the view in which we are searching for
  // shit
  Controller.prototype.createViewsOn = function(view, map)
  {
    for (var selector in map) {
      var info = map[selector];
      var domElement = view.$(selector)[0];

      if (info instanceof Function)
        this._createView(domElement, info, null);
      else
        this._createView(domElement, info.View, info.context);
    }
  };

  // Where the magic happens for createViewsOn. Uses a hidden method on the
  // view to ensure cool shit
  Controller.prototype._createView = function(domElement, TView, context)
  {
    var view = new TView(domElement);

    // Use a binding to set the context if provided, otherwise just dump and
    // chump
    if (context instanceof Binding)
      context.setTarget(view, 'context');
    else if (context)
      view.context = context;

    view._birthRitual();

    var key = TView.name;
    key = key.charAt(0).toLowerCase() + key.slice(1);
    this[key] = view;
  };

  // Formatting
  Controller.prototype.toString = function()
  {
    return '[Controller::' + this.constructor.name + ']';
  };

  return Controller;

})();

