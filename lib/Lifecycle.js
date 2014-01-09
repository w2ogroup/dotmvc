module.exports = Lifecycle;

/**
 * Interface that allows a class to have some notion of a lifecycle-- getting
 * methods called on it at various points to allow for setup / teardown ritual.
 * Enforces a strick state-machine as well.
 * @constructor
 */
function Lifecycle()
{

}

/**
 * Possibles states of a lifecycled object.
 * @enum
 */
Lifecycle.stages = stages = {
  NEW     : '',
  CREATE  : 'onCreate',
  START   : 'onStart',
  RESUME  : 'onResume',
  PAUSE   : 'onPause',
  STOP    : 'onStop',
  DESTROY : 'onDestroy'
};

// State machine
var sm = { };
sm[stages.NEW]     = [stages.CREATE];
sm[stages.CREATE]  = [stages.START];
sm[stages.START]   = [stages.RESUME];
sm[stages.RESUME]  = [stages.PAUSE];
sm[stages.PAUSE]   = [stages.RESUME, stages.STOP];
sm[stages.STOP]    = [stages.DESTROY];
sm[stages.DESTROY] = [];

// Ensure we have all the methods we need to be lifecycled
Lifecycle.isLifecycled = function(instance)
{
  for (var key in stages) {
    var methodName = stages[key];
    if (!methodName) continue;
    if (!(instance[methodName] instanceof Function))
      return false;
  }

  return true;
};

Lifecycle.prototype.changeState = function(state)
{
  if (!this.__state) {
    Object.defineProperty(this, '__state', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: stages.NEW
    });
  }

  var validStateChange = ~sm[this.__state].indexOf(state);

  if (!validStateChange)
    throw new Error('Invalid state change, cannot ' + state +
      ' when in ' + this.__state);

  this.__state = state;
  this[state]();
};

Lifecycle.prototype.getState = function()
{
  return this.__state || null;
};

Lifecycle.prototype.onCreate = function()
{

};

Lifecycle.prototype.onStart = function()
{

};

Lifecycle.prototype.onResume = function()
{

};

Lifecycle.prototype.onPause = function()
{

};

Lifecycle.prototype.onStop = function()
{

};

Lifecycle.prototype.onDestroy = function()
{

};

