var Resolver = require('../../lib/Resolver.js');

QUnit.module('Resolver');

test('Basic single dep constructor registration', function() {

  var r = new Resolver();
  var t = 't';
  var T = function T() {};

  r.register(t, T);
  strictEqual(r.make(t).constructor, T, 'Make returns instance');

});

test('Register throws', function() {

  var r = new Resolver();
  var t = 't';
  var T = function T() {};

  r.register(t, T);
  throws(function() {
    r.register(t, T);
  }, Resolver.ResolverInternalError, 'Dupe on register');

});

test('Resolve method throws', function() {

  var r = new Resolver();

  throws(function() {
    r._resolve('not there');
  }, Resolver.ResolverInternalError, 'Missing type');
});

test('Basic dep track', 5, function() {

  var r = new Resolver();
  var A = function() { ok(true, 'A ctor fired'); };
  var B = function() { ok(true, 'B ctor fired'); };
  var T = function T(a, b) {
    ok(true, 'T ctor fired');
    strictEqual(true, a instanceof A, 'A passed in');
    strictEqual(true, b instanceof B, 'B passed in');
  };

  r.register('t', T);
  r.register('b', B);
  r.register('a', A);

  r.make('t');

});

test('Throw on unmet dep', function() {

  var r = new Resolver();
  r.register('T', function(A, B, C) {});
  throws(function() {
    r.make('T');
  }, Resolver.ResolverInternalError, 'no deps');

});

test('Make from ctor', function() {

  var r = new Resolver();
  function T(a) {
    strictEqual(true, a instanceof A, 'a passed in');
  }
  function A() { ok(true, 'A ctor fired'); }

  r.register('a', A);
  r.makeFromConstructor(T);

});

test('Singletons', 2, function() {

  var r = new Resolver();
  function T() { ok(true, 'T ctor fired'); }
  r.singleton('t', T);

  strictEqual(r.make('t'), r.make('t'), 'Same instance created');

});

test('Singleton as a dep', 2, function() {

  var r = new Resolver();
  function T(a) {
    ok(true, 'T ctor called');
  }

  function A() {
    ok(true, 'A ctor called');
  }

  r.register('a', A);
  r.singleton('t', T);

  r.make('t');
  r.make('t');

});

test('Using closures', function() {


  var r = new Resolver();
  var DEP = {};
  var B_DEP = {};

  r.register('dep', function() {
    return DEP;
  });

  strictEqual(r.make('dep'), DEP, 'no deps');

  function A() { }
  r.register('a', A);
  r.register('b', function() {
    return B_DEP;
  });
  r.register('c', function(a, b) {
    return { a: a, b: b };
  });

  ok(r.make('c').a instanceof A, 'a instantiated');
  strictEqual(r.make('c').b, B_DEP, 'b corret');




});
