var View       = require('../../lib/View.js');
var Signal     = require('../../lib/Signal.js');
var Observable = require('smack').Observable;
var __extends  = require('typedef').extends;

QUnit.module('Signal');

test('Signal creation semantics', function() {

  throws(function() { new Signal(); }, 'no args');
  throws(function() { new Signal({}); }, '1 arg');
  throws(function() { new Signal({}, ''); }, 'empty type');

});

test('Signal handers can only have 1 function per type', function() {

  var SIG = 'SIG';
  var handler = new Signal.SignalHandler();
  handler.registerSignalHandler(SIG, function() {});
  throws(
    function() { handler.registerSignalHandler(SIG, function() {}); },
    'dupe');

});

test('Signal request interface', 5, function() {

  var sender = new Signal.SignalSender();
  var type  = 'asdf';
  var param = {};
  var recv = false;
  sender.on(Signal.SEND_SIGNAL, function(signal) {
    strictEqual(this, sender, 'message context correct');
    strictEqual(signal.parameter, param, 'param sent correctly');
    strictEqual(signal.type, type, 'type sent correctly');
    strictEqual(signal.from, this, 'from setup correctly');
    recv = true;
  });

  sender.sendSignal(type, param);
  strictEqual(recv, true, 'synchronous signal sent');

});

test('Signal handler interface', 4, function() {

  var handler = new Signal.SignalHandler();
  var SIG     = 'signaltype';
  var PARAM   = {};
  var RESP    = {};

  handler.registerSignalHandler(SIG, function(param) {
    strictEqual(this, handler, 'context correct');
    strictEqual(param, PARAM, 'paramter passed');
    return RESP;
  });

  var signal = new Signal(this, SIG, PARAM);
  var handled = Signal.attemptSignalHandle(handler, signal);
  strictEqual(handled, true, 'handled');
  strictEqual(signal.response, RESP, 'correct response');

});

test('Basic signalling view -> view', 7, function() {

  var SIG      = 'SIG';
  var SIG2     = 'SIG2';
  var PARAM    = {};
  var ROOT_RET = {};
  var v        = new View();

  v.registerSignalHandler(SIG, function(p) {
    strictEqual(p, PARAM, 'handler fired and param fired');
    strictEqual(this, v, 'context preserved for view');
  });

  v.sendSignal(SIG, PARAM); // BOOM

  var child = new View();
  v.addView(child);
  child.sendSignal(SIG, PARAM); // BOOM

  var root = new View();
  root.addView(v);
  root.registerSignalHandler(SIG2, function() {
    ok(true, 'root sig fired'); // +1
    return ROOT_RET;
  });
  var signal = v.sendSignal(SIG2);
  strictEqual(signal.response, ROOT_RET, 'root handler return val');
  child.sendSignal(SIG2); // BOOM

});

test('Data context signalling view -> data context', 6, function() {

  var SIG   = 'SIG';
  var PARAM = {};
  var view    = new View();
  var context = new Signal.SignalHandler();
  context.registerSignalHandler(SIG, function(p) {
    ok(true, 'handler fired on context');
    strictEqual(p, PARAM, 'param is correct');
  });

  view.context = context;

  view.sendSignal(SIG, PARAM); // BOOM

  var child = new View();
  view.addView(child);
  child.sendSignal(SIG, PARAM); // BOOM

  var gchild = new View();
  child.addView(gchild);
  gchild.sendSignal(SIG, PARAM); // BOOM

});

test('Signalling data context -> view', 9, function() {

  var SIG      = 'SIG';
  var PARAM    = {};
  var view     = new View();
  var context  = new Signal.SignalSender();
  view.context = context;
  view.registerSignalHandler(SIG, function(p) {
    ok(true, 'handler fired on view');
    strictEqual(this, view, 'context correct');
    strictEqual(p, PARAM, 'param passed');
  });

  context.sendSignal(SIG, PARAM); // boom x3

  var root = new View();
  root.registerSignalHandler(SIG, function() { throw '!!'; });
  root.addView(view);

  // no throws in root
  context.sendSignal(SIG, PARAM); // boom 3x

  view.context = null;
  context.sendSignal(SIG, PARAM); // nop!
  var child = new View();
  child.context = context;
  view.addView(child);
  context.sendSignal(SIG, PARAM); // BOOM 3x

});
