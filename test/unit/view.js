var View            = require('../../lib/View.js');
var CommandProvider = require('../../lib/CommandProvider.js');

QUnit.module('View');

var test = QUnit.test;
var strictEqual = QUnit.strictEqual;
var ok = QUnit.ok;


test('Basic view', function() {

  var node = document.createElement('div');
  var v = new View(node);
  strictEqual(v.element, node, 'dom identity');

});

test('executing commands', 2, function() {

  var v     = new View();
  var vm    = new CommandProvider();
  var param = {};
  var ret   = {};

  vm.command = function(p) {
    strictEqual(p, param, 'correct param');
    return ret;
  };
  vm.registerCommand({ command: vm.command });

  v.init();
  v.setDataContext(vm);

  // fires on context
  var response = v.executeCommand({ command: param });
  strictEqual(response, ret, 'legit response');

});

test('executing commands on nested views', 2, function() {

  var vm    = new CommandProvider();
  var param = {};
  var ret   = {};

  vm.command = function(p) {
    strictEqual(p, param, 'correct param');
    return ret;
  };
  vm.registerCommand({ command: vm.command });

  var p = new View();
  var c = new View();
  p.addView(c);
  p.init();
  p.setDataContext(vm);

  var response = c.executeCommand({ command: param });
  strictEqual(response, ret, 'legit response');

});

