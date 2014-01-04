var ControllerManager = require('../../lib/ControllerManager.js');
var Resolver          = require('../../lib/Resolver.js');
var Router            = require('../../lib/Router.js');

QUnit.module('ControllerManager');

test('Basic controller registration and index', 5, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var RESP = {};

  var manager = new ControllerManager(app);
  var instance;

  function TestController() {}
  TestController.prototype.indexAction = function(){
    instance = instance || this;
    strictEqual(instance, this, 'same context');
    return RESP;
  };

  manager.registerController('test', TestController);

  router.dispatch('test');
  router.dispatch('test/');
  router.dispatch('/test');
  var resp = router.dispatch('/test/');
  strictEqual(resp, RESP, 'response');

});

test('Controller with action', 3, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);
  function TestController() {}

  TestController.prototype.coolAction = function() {
    ok(true, 'fired');
  };

  manager.registerController('test', TestController);

  router.dispatch('test/cool');
  router.dispatch('/test/cool/');
  router.dispatch('test/cool/');

  // nops
  router.dispatch('test/cool/something');
  router.dispatch('something/test/cool');
});

test('Arguments for controller', function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  function TestController() {}
  TestController.prototype.userAction = function(id) {
    ok(true, 'fired');
    strictEqual(this instanceof TestController, true, 'context');
    strictEqual(id, '1', 'param passed');
  };

  manager.registerController('test', TestController);

  router.dispatch('test/user/1');
  router.dispatch('test/user/1/');
  router.dispatch('/test/user/1/');

});
