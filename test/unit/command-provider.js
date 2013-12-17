var CommandProvider = require('../../lib/CommandProvider.js');
var Command         = require('../../lib/Command.js');

QUnit.module('CommandProvider');

var test        = QUnit.test;
var ok          = QUnit.ok;
var strictEqual = QUnit.strictEqual;
var throws      = QUnit.throws;

test('basic functionality', function() {

  var t = new CommandProvider();
  var param = {};
  var ret = {};
  var cb = function() {
    ok(true, 'command fired');
    return ret;
  };

  t.registerCommand({ command: cb });

  var command = new Command(global, 'command', param);
  var r = CommandProvider.attemptExecuteCommand(t, command);
  strictEqual(r, true, 'command handled');
  strictEqual(command.response, ret, 'command response value');

});

test('callback context', 2, function() {
  var t = new CommandProvider();
  t.cb = function() { strictEqual(this, t, 'context preserved'); };
  t.cb();
  t.registerCommand({ command: t.cb });
  CommandProvider.attemptExecuteCommand(t, new Command(global, 'command'));
});

test('Duped handlers', function() {
  var t = new CommandProvider();
  var cb = function() {};
  t.registerCommand({ command: cb });

  throws(function() {
    t.registerCommand({ command: cb });
  }, 'cannot have multi handlders');
});

test('Bad command construction', function() {

  var Command = Command;

  throws(function() { new Command(); }, 'no params throws');
  throws(function() { new Command({}); }, 'no message name throws');
  ok(function() { new Command({}, ''); }, 'from and name ok');

});
