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
  strictEqual(v.element, node, 'dom identity');

});

test('Constructor throws', function() {

  throws(function() {
    var V = makeViewClass();
    V.DOM_NODE = 'li';
    new V(document.createElement('div'));
  }, 'view node mismatch');

});

