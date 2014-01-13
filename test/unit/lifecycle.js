var Lifecycle = require('../../lib/Lifecycle.js');
var mixin_    = require('typedef').mixin;

QUnit.module('Lifecycle');

test('State changes', function() {

  var t = new Lifecycle();

  for (var key in Lifecycle.states) {
    var methodName = Lifecycle.states[key];
    (function(methodName) {
      t[methodName] = function() {
        ok(true, 'ran something...');
        strictEqual(this.getState(), methodName, 'ran ' + methodName + '()');
      };
    })(methodName);
  }

  t.changeState(Lifecycle.states.CREATE);
  strictEqual(t.getState(), Lifecycle.states.CREATE, 'CREATE changed');

  t.changeState(Lifecycle.states.START);
  strictEqual(t.getState(), Lifecycle.states.START, 'START changed');

  t.changeState(Lifecycle.states.RESUME);
  strictEqual(t.getState(), Lifecycle.states.RESUME, 'RESUME changed');

  t.changeState(Lifecycle.states.PAUSE);
  strictEqual(t.getState(), Lifecycle.states.PAUSE, 'PAUSE changed');

  t.changeState(Lifecycle.states.RESUME);
  strictEqual(t.getState(), Lifecycle.states.RESUME, 'RESUME changed');

  t.changeState(Lifecycle.states.PAUSE);
  strictEqual(t.getState(), Lifecycle.states.PAUSE, 'PAUSE changed');

  t.changeState(Lifecycle.states.STOP);
  strictEqual(t.getState(), Lifecycle.states.STOP, 'STOP changed');

  t.changeState(Lifecycle.states.DESTROY);
  strictEqual(t.getState(), Lifecycle.states.DESTROY, 'DESTROY changed');

});
