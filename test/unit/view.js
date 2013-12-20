var View      = require('../../lib/View.js');
var __extends = require('../../lib/util/extends.js');

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

