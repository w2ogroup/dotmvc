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

test('Multi args', 6, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  function TestController() {}
  TestController.prototype.awesomeAction = function(a, b) {
    strictEqual(a, 'a', 'option a');
    strictEqual(b, 'b', 'option b');
  };

  manager.registerController('test', TestController);

  // Nops
  router.dispatch('test/awesome');
  router.dispatch('test/awesome/');
  router.dispatch('test/awesome/a');
  router.dispatch('test/awesome/ab');
  router.dispatch('test/awesome/ab/');

  router.dispatch('test/awesome/a/b/');
  router.dispatch('/test/awesome/a/b/');
  router.dispatch('/test/awesome/a/b');
});

test('Optional args', function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  function TestController() {}
  TestController.prototype.awesomeAction = function(checkB, _b) {
    ok(checkB, 'checkB provided');
    strictEqual(checkB === 'yes', !!_b, 'optional coming through');
  };

  manager.registerController('test', TestController);

  // nop
  router.dispatch('test/awesome');

  router.dispatch('test/awesome/no');
  router.dispatch('test/awesome/no/');
  router.dispatch('test/awesome/yes/blah');
  router.dispatch('test/awesome/yes/blah/');

});

test('Rest args', 9, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  var rando = 'asdf asdf / !!#$#(%#%#%)#%I#% / / / / a fd asd $ @ asdf asdf ad';

  function TestController() {}
  TestController.prototype.awesomeAction = function(rest) {
    strictEqual(rest, rando, 'param came through');
  };
  TestController.prototype.ballerAction = function(check, _rest) {
    if (check === 'no') {
      ok(true, 'no check');
      return;
    }
    strictEqual(_rest, rando, 'param came through');
  };
  TestController.prototype.legitAction = function(always, _check, _rest)
  {
    strictEqual(always, 'always', 'always');
    if (!_check) return;
    strictEqual(_check, 'yes', 'checking');
    strictEqual(_rest, rando);
  };

  manager.registerController('test', TestController);

  router.dispatch('test/awesome/' + rando);

  router.dispatch('test/baller/'); // nop
  router.dispatch('test/baller/no');
  router.dispatch('test/baller/no/');
  router.dispatch('test/baller/yes/' + rando);

  router.dispatch('test/legit'); // nop
  router.dispatch('test/legit/always'); // 1
  router.dispatch('test/legit/always/'); // 1
  router.dispatch('test/legit/always/yes/' + rando); // 3

});

test('Controller load and unload', 5, function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  function TestController() {}
  TestController.prototype.indexAction = function() { };
  TestController.prototype.load = function() { ok(true, 'loaded'); };
  TestController.prototype.unload = function() { ok(true, 'unloaded'); };

  function TestControllerB() {}
  TestControllerB.prototype.indexAction = function() { };
  TestControllerB.prototype.load = function() { ok(true, 'B loaded'); };
  TestControllerB.prototype.unload = function() { ok(true, 'B unloaded'); };

  manager.registerController('test', TestController);
  manager.registerController('test-b', TestControllerB);

  router.dispatch('test');
  router.dispatch('test-b');
  router.dispatch('test');

});

test('Controller with deps', function() {

  var app = new Resolver();
  app.singleton('router', Router);
  var router = app.make('router');
  var manager = new ControllerManager(app);

  function A() { }
  function B() { }

  app.singleton('a', A);
  app.singleton('b', B);

  function TestController(a, b) {
    ok(a instanceof A, 'a is good');
    ok(b instanceof B, 'b is good');
  }
  TestController.prototype.indexAction = function() { };

  manager.registerController('test', TestController);

  router.dispatch('test');

  function BadController(notThere) {  }
  BadController.prototype.indexAction = function() {};
  manager.registerController('bad', BadController);

  throws(function() { router.dispatch('bad'); }, 'missing dep');


});
