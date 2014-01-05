var Facade    = require('../../lib/Facade.js');
var Resolver  = require('../../lib/Resolver.js');
var __mixin = require('../../lib/util/mixin.js');

QUnit.module('Facade');

function mockResolver(makeResult)
{
  return {
    make: function() { return makeResult; }
  };
}

test('Basic facade creation and swapping', 10, function() {


  function F() { }
  function G() { }
  F.prototype.method1 = function() {
    ok(this instanceof F, 'context');
    return '1';
  };
  F.prototype.methodZ = function() { return 'F Z'; };

  G.prototype.methodA = function() {
    ok(this instanceof G, 'context');
    return 'A';
  };
  G.prototype.methodZ = function() { return 'G Z'; };
  var resolver = new Resolver();
  resolver.register('f', F);
  resolver.register('g', G);

  var current;

  function Fake() { }
  __mixin(Fake, Facade);
  Fake.resolver = resolver;
  Fake.getFacadeAccessor = function () { return current; };

  Fake.something = function()
  {
    var instance = this.getInstance();
    return instance.method1();
  };

  current = 'f';
  Fake.map();
  ok(Fake.getInstance() instanceof F, 'f in there');
  strictEqual(Fake.method1(), '1', '1');
  strictEqual(Fake.something(), '1', '1');
  strictEqual(Fake.methodZ(), 'F Z', 'F Z');

  current = 'g';
  Fake.map();
  strictEqual(Fake.method1, undefined, 'nope');
  strictEqual(Fake.methodA(), 'A', 'A');
  strictEqual(Fake.methodZ(), 'G Z', 'G Z');

});

test('Swapping out', function() {

  function F() { }
  F.prototype.method = function() { return 'real'; };
  var resolver = new Resolver();
  resolver.register('f', F);

  function Fake() { }
  __mixin(Fake, Facade);
  Fake.resolver = resolver;
  Fake.getFacadeAccessor = function () { return 'f'; };
  Fake.map();

  strictEqual(Fake.method(), 'real', 'real method');
  Fake.swap({ method: function() { return 'mock'; } });
  strictEqual(Fake.method(), 'mock', 'mocked');
  Fake.swap({ method: function() { return 'mock2'; } });
  strictEqual(Fake.method(), 'mock2', 'mocked');
  Fake.swap(null);
  strictEqual(Fake.method(), 'real', 'mocked');
});

