var Lifecycle = require('../../lib/Lifecycle.js');
var mixin_    = require('../../lib/util/mixin.js');

QUnit.module('Lifecycle');

test('State changes', function() {

  var t = new Lifecycle();

  for (var key in Lifecycle.stages) {
    var methodName = Lifecycle.stages[key];
    (function(methodName) {
      t[methodName] = function() {
        ok(true, 'ran something...');
        strictEqual(this.getState(), methodName, 'ran ' + methodName + '()');
      };
    })(methodName);
  }

  t.changeState(Lifecycle.stages.CREATE);
  strictEqual(t.getState(), Lifecycle.stages.CREATE, 'CREATE changed');

  t.changeState(Lifecycle.stages.START);
  strictEqual(t.getState(), Lifecycle.stages.START, 'START changed');

  t.changeState(Lifecycle.stages.RESUME);
  strictEqual(t.getState(), Lifecycle.stages.RESUME, 'RESUME changed');

  t.changeState(Lifecycle.stages.PAUSE);
  strictEqual(t.getState(), Lifecycle.stages.PAUSE, 'PAUSE changed');

  t.changeState(Lifecycle.stages.RESUME);
  strictEqual(t.getState(), Lifecycle.stages.RESUME, 'RESUME changed');

  t.changeState(Lifecycle.stages.PAUSE);
  strictEqual(t.getState(), Lifecycle.stages.PAUSE, 'PAUSE changed');

  t.changeState(Lifecycle.stages.STOP);
  strictEqual(t.getState(), Lifecycle.stages.STOP, 'STOP changed');

  t.changeState(Lifecycle.stages.DESTROY);
  strictEqual(t.getState(), Lifecycle.stages.DESTROY, 'DESTROY changed');

});
