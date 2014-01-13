var UIManager = require('../../lib/browser/UiManager.js');
var Resolver  = require('../../lib/Resolver.js');

QUnit.module('UIManager');

test('Basic content set', function() {

  var root = document.createElement('div');
  var mockResolver = { make: function(d) { return d; } };

  var manager = new UIManager(root, mockResolver);

  manager.setContent('Hello!');
  strictEqual(root.innerHTML, 'Hello!');
  manager.setContent('Goodbye!');
  strictEqual(root.innerHTML, 'Goodbye!');

});

test('Basic view templates', function() {

  var root = document.createElement('div');
  var mockResolver = {
    make: function(T) { return T instanceof Function ? new T() : T; }
  };

  // Views can be template functions like this
  var template = function(content) { return '<b>' + content + '</b>'; };

  var manager = new UIManager(root, mockResolver);

  // Setup defualt template
  manager.registerTemplate(function() { return template; });

  manager.setContent('hello');
  strictEqual(root.innerHTML, '<b>hello</b>');

});

test('setDateContext() interface templates', 1, function() {

  var CONTEXT = { };
  var root = document.createElement('div');
  var mockResolver = {
    make: function(T) { return T instanceof Function ? new T() : T; }
  };

  //
  function TestView() { this.element = document.createElement('div'); }
  TestView.prototype.setDataContext = function(context) {
    strictEqual(context, CONTEXT);
  };

  var manager = new UIManager(root, mockResolver);
  manager.registerTemplate(TestView);

  manager.setContent(CONTEXT);

});

test('Integration test: Template via resolver', 5, function() {

  var CONTEXT = { };
  var root = document.createElement('div');
  var resolver = new Resolver();
  var manager = new UIManager(root, resolver);

  function A() { ok(true, 'a made!'); }
  function B() { ok(true, 'b made!'); }
  function V(a, b) {
    this.element = document.createElement('div');
    ok(a instanceof A, 'a is good');
    ok(b instanceof B, 'a is good');
  }
  V.prototype.setDataContext = function(context) {
    strictEqual(context, CONTEXT);
  };

  resolver.register('a', A);
  resolver.register('b', B);

  manager.registerTemplate(V);
  manager.setContent(CONTEXT);


});
