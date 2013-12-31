var ControllerManager = require('../../lib/ControllerManager.js');
var Resolver          = require('../../lib/Resolver.js');
var Router            = require('../../lib/Router.js');

QUnit.module('ControllerManager');

test('Basic controller registration and index', 4, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');

  var manager = new ControllerManager(app);
  var instance;

  function TestController() {}
  TestController.prototype.indexAction = function(){
    instance = instance || this;
    strictEqual(instance, this, 'same context');
  };

  manager.registerController('test', TestController);

  router.dispatch('test');
  router.dispatch('test/');
  router.dispatch('/test');
  router.dispatch('/test/');

});

test('Controller with action', 3, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);
  manager.registerController('test', TestController);

  function TestController() {}
  TestController.prototype.coolAction = function() {
    ok(true, 'fired');
  };

  router.dispatch('test/cool');
  router.dispatch('/test/cool/');
  router.dispatch('/test/cool/some/shit');

});
