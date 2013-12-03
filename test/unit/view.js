var View = require('../../lib/View.js');

QUnit.module('View');

var test = QUnit.test;
var strictEqual = QUnit.strictEqual;


test('Basic view', function() {

  var node = document.createElement('div');
  var v = new View(node);
  strictEqual(v.element, node, 'dom identity');

});
