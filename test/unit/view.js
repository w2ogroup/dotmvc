var View      = require('../../lib/View.js');
var __extends = require('../../lib/util/extends.js');

QUnit.module('View');

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

});

test('Constructor throws', function() {

  var V = makeViewClass();
  V.DOM_NODE = 'li';
  throws(function() {
    new V(document.createElement('div'));
  }, 'View node name mismatch');

  var div = document.createElement('div');
  new View(div);
  throws(function() { new View(div); }, 'Dupe on dom nodes');

});

test('init() throws', function() {

  var v = new View();
  v.init();
  throws(function() { v.init(); }, 'Dupe on init()');

  var w = new View();
  w.template = function() {};
  w.layout = function() {};
  throws(function() { w.init(); }, 'Layout and template');

});

test('render() throws', function() {

  var v = new View();
  v.init = function() {};
  throws(function() { v.render(); }, 'Base init() not called');

  var w = new View();
  w.close();
  throws(function() { v.render(); }, 'Post-close render()');

});

test('addView() throws', function() {

  var v = new View();
  v.template = function() {};
  throws(function() { v.addView(new View()); }, 'Unsafe addView');

  var w = new View();
  w.render = function() {};
  throws(function() { new View().addView(w); }, 'Base render() not called');

});

test('clear() throws', function() {

  var v = new View();
  v.layout = function() {};
  throws(function() { v.clear(); }, 'clear() with layout');

  v = new View();
  v._subviewsCreated = true; // simulate call createView
  throws(function() { v.clear(); }, 'clear() with subviews');

});

