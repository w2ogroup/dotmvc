var View       = require('../../lib/View.js');
var Observable = require('../../lib/Observable.js');
var __extends  = require('../../lib/util/extends.js');

QUnit.module('View');

var ViewInternalError = View.ViewInternalError;

function makeViewClass() {
  __extends(ViewClass, View);
  function ViewClass() {
    ViewClass.Super.apply(this, arguments);
  }
  return ViewClass;
}

test('Basic view', function() {

  var node = document.createElement('div');
  var v = new View(node);
  strictEqual(v.element, node, 'DOM identity');
  strictEqual(node.view, v, 'view property added to DOM node');
  strictEqual(v.$element[0], v.element, 'jQuery element');

});

test('Constructor throws', function() {

  var V = makeViewClass();
  V.DOM_NODE = 'li';
  throws(function() {
    new V(document.createElement('div'));
  }, ViewInternalError, 'View node name mismatch');

  var div = document.createElement('div');
  new View(div);
  throws(function() { new View(div); },
    ViewInternalError, 'Dupe on dom nodes');

});

test('init() throws', function() {

  var v = new View();
  v.init();
  throws(function() { v.init(); },
    ViewInternalError, 'Dupe on init()');

  var w = new View();
  w.template = function() {};
  w.layout = function() {};
  throws(function() { w.init(); },
    ViewInternalError, 'Layout and template');

});

test('render() throws', function() {

  var v = new View();
  v.init = function() {};
  throws(function() { v.render(); },
    ViewInternalError, 'Base init() not called');

  var w = new View();
  w.close();
  throws(function() { v.render(); },
    ViewInternalError, 'Post-close render()');

});

test('addView() throws', function() {

  var v = new View();
  v.template = function() {};
  throws(function() { v.addView(new View()); },
    ViewInternalError, 'Unsafe addView');

  var w = new View();
  w.render = function() {};
  throws(function() { new View().addView(w); },
    ViewInternalError, 'Base render() not called');

});

test('clear() throws', function() {

  var v = new View();
  v.layout = function() {};
  throws(function() { v.clear(); },
    ViewInternalError, 'clear() with layout');

  v = new View();
  v._subviewsCreated = true; // simulate call createView
  throws(function() { v.clear(); },
    ViewInternalError, 'clear() with subviews');

});

test('Layout semantics', function() {

  var layout = function() { return '<div id="a"></div>'; };
  var v = new View();
  v.layout = layout;
  v.render();
  var node = v.$('#a')[0];
  v.render();
  strictEqual(node, v.$('#a')[0], 'DOM identity preserved across render()');

});

asyncTest('Basic data context semantics', function() {

  var v = new View();
  var rendered = false;
  var last = {};
  v.render = function() {
    View.prototype.render.call(this);
    rendered = true;
    strictEqual(this.context, last, 'context is last one we set on stack');
    ok(true, 'render fired');
    start();
  };

  var context = {};
  v.context = context;
  strictEqual(v.context, context, 'synchronous context setting');
  strictEqual(rendered, false, 'render() on context change is async');
  v.context = context; // nop
  v.context = 123; // nop
  v.context = 555; // nop
  v.context = last;

});

asyncTest('Observable data context', function() {

  var v = new View();
  v.render = function() {
    View.prototype.render.call(this);
    strictEqual(this.context.a, 3, 'obv property is correct');
    start();
  };

  var context = new Observable();
  context.registerProperty('a', 123);

  v.context = context;
  context.a = 3;

});

