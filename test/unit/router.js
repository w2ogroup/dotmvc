var Router = require('../../lib/Router.js');

QUnit.module('Router');

test('Basic callback dispatch', 1, function() {

  var r = new Router();
  r.createRoute('/', function() { ok(true, 'callback fired'); });
  r.dispatch('/');

});

test('Parameter passing', 3, function() {

  var router = new Router();
  var paramA = 'asdf';
  var paramB = '1234';
  router.createRoute('/route/{a}', function(a) {
    strictEqual(a, paramA, 'paramter passed');
  });

  router.dispatch('/route/asdf');

  router.createRoute('/route/{a}/{b}', function(a, b) {
    strictEqual(a, paramA, 'a paramter passed');
    strictEqual(b, paramB, 'b paramter passed');
  });

  router.dispatch('/route/asdf/1234');

});

test('Optional params', function() {

  var router = new Router();
  var dispatched = 0;

  router.createRoute('route/{a?}', function(a) {
    dispatched++; // x1
    strictEqual(a, '123', 'a correct value (or missing)');
  });

  router.dispatch('route/123');
  strictEqual(dispatched, 1, 'route/123');

  router.createRoute('another/{a?}/{b?}', function(a, b) {
    dispatched++;
    ok(true, 'another fired'); // 3x
  });

  router.dispatch('another');
  strictEqual(dispatched, 2, 'another');
  router.dispatch('another/1');
  strictEqual(dispatched, 3, 'another/1');
  router.dispatch('another/1/2');
  strictEqual(dispatched, 4, 'another/1/2');
});

test('Action handler', 2, function() {

  var router = new Router();
  var ACTION = {};

  router.addHandler({
    onAction: function(route, args) {
      ok(true, 'executeAction() fired');
      strictEqual(route.action, ACTION, 'action passed');
    }
  });

  router.createRoute('route', ACTION);
  router.dispatch('route');

});

test('Response handler', 2, function() {

  var router = new Router();
  var RESP = {};

  router.createRoute('route/{a?}', function(a) {
    if (a) return RESP;
  });

  router.addHandler({
    onResponse: function(resp) {
      ok(true, 'handleResponse fired');
      strictEqual(resp, RESP, 'response object passed in');
    }
  });

  router.dispatch('route'); // nop
  router.dispatch('route/something');

});

test('Action handler fallthrough', function() {

  var router = new Router();
  var first = false;
  var a = 0;
  var b = 0;
  router.addHandler({
    onAction: function() { a++; return first; }
  });
  router.addHandler({
    onAction: function() { b++; }
  });

  router.createRoute('something', {});
  router.dispatch('something');
  strictEqual(a, 1, 'first fired');
  strictEqual(b, 1, 'second fired');

  first = true;
  router.dispatch('something');
  strictEqual(a, 2, 'first fired');
  strictEqual(b, 1, 'second NOT fired');

});

test('Response handler fallthrough', function() {

  var router = new Router();
  var first = false;
  var a = 0;
  var b = 0;

  router.addHandler({
    onResponse: function(resp) { a++; return first; }
  });
  router.addHandler({
    onResponse: function(resp) { b++; }
  });
  router.createRoute('something', function() { return true; });

  router.dispatch('something');
  strictEqual(a, 1, 'first fired');
  strictEqual(b, 1, 'second fired');

  first = true;
  router.dispatch('something');
  strictEqual(a, 2, 'first fired');
  strictEqual(b, 1, 'second NOT fired');

});

test('Handler via deps', 4, function() {

  var ACTION = {};
  var RESP   = {};
  var route;

  var mockResolver = {
    make: function(d) { return d === 'a' ? new A() : new B(); }
  };

  function A() { }
  A.prototype.onAction = function(r, args)  {
    deepEqual(args, ['1', '2'], 'args');
    strictEqual(r, route, 'route passed in');
    strictEqual(r.action, ACTION, 'action passed in');
    return RESP;
  };
  function B() { }
  B.prototype.onResponse = function(response)  {
    strictEqual(response, RESP, 'response');
  };

  var router = new Router(mockResolver);
  router.addHandler('a');
  router.addHandler('b');
  route = router.createRoute('test/{a}/{b}', ACTION);
  router.dispatch('test/1/2');

});

test('getUrl()', function() {

  var router = new Router();
  router.createRoute('test/{name}/is/{adjective}/{extra...?}',
    function(name, adjective, extra) { })
    .default('adjective', 'baller')
    .named('test');

  strictEqual(router.getUrl('test',
    { name: 'Brandon', adjective: 'awesome' }),
    'test/Brandon/is/awesome');

  strictEqual(router.getUrl('test',
    { adjective: 'awesome', name: 'Brandon', extra: 'forreal!' }),
    'test/Brandon/is/awesome/forreal!');

  strictEqual(router.getUrl('test',
    { name: 'Brandon', extra: 'forreal!' }),
    'test/Brandon/is/baller/forreal!');

});

test('With deps', function() {

  var mockResolver = {
    make: function(d) { return d === 'a' ? new A() : new B(); }
  };

  function A() { }
  function B() { }

  var router = new Router(mockResolver);

  router.createRoute('test/{noun}/is/{adjective}',
    function(noun, adjective, a, b) {
      ok(a instanceof A, 'a dep');
      ok(b instanceof B, 'b dep');
    })
    .with('a', 'b');

  router.dispatch('test/brandon/is/awesome');

});
