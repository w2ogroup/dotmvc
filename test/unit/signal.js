var View       = require('../../lib/View.js');
var Observable = require('../../lib/Observable.js');
var Signal     = require('../../lib/Signal.js');
var __extends  = require('../../lib/util/extends.js');

QUnit.module('Signal');

test('Signal creation semantics', function() {

  throws(function() { new Signal(); }, 'no args');
  throws(function() { new Signal({}); }, '1 arg');
  throws(function() { new Signal({}, ''); }, 'empty type');

});

