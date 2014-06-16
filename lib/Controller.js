module.exports = Controller;

var __mixin    = require('typedef').mixin;
var Observable = require('./Observable.js');

__mixin(Controller, Observable);

// Routing unit that is responsible for tying urls to behavior. Should be
// extended in the form of "SomethingController", e.g. "AdminController",
// which will automatically get all public methods wired up to the URL
// router by the application
function Controller(app)
{
  // Injected by the router-- reference to the <body>-bound view
  this.window = null;

  this.application = app;

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

// Formatting
Controller.prototype.toString = function()
{
  return '[Controller::' + this.constructor.name + ']';
};
