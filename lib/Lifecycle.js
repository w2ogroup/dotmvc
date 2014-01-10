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
Lifecycle.states = {
  NEW     : '',
  CREATE  : 'onCreate',
  START   : 'onStart',
  RESUME  : 'onResume',
  PAUSE   : 'onPause',
  STOP    : 'onStop',
  DESTROY : 'onDestroy'
};
var states = Lifecycle.states;

// State machine
var sm = { };
sm[states.NEW]     = [states.CREATE];
sm[states.CREATE]  = [states.START];
sm[states.START]   = [states.RESUME];
sm[states.RESUME]  = [states.PAUSE];
sm[states.PAUSE]   = [states.RESUME, states.STOP];
sm[states.STOP]    = [states.DESTROY];
sm[states.DESTROY] = [];

/**
 * Ensure we have all the methods we need to be lifecycled on an instance.
 * @return {bool} True if an instance is lifecycled.
 */
Lifecycle.isLifecycled = function(instance)
{
  for (var key in states) {
    var methodName = states[key];
    if (!methodName) continue;
    if (!(instance[methodName] instanceof Function))
      return false;
  }

  return true;
};

/**
 * Advance the state of this object. Throws if its an invalid state transition
 * @param {Lifecylce.states} state
 * @return {*} Whatever the lifecycle event returns for its new state.
 */
Lifecycle.prototype.changeState = function(state)
{
  if (!this.__state) {
    Object.defineProperty(this, '__state', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: states.NEW
    });
  }

  var validStateChange = ~sm[this.__state].indexOf(state);

  if (!validStateChange)
    throw new Error('Invalid state change, cannot ' + state +
      ' when in ' + this.__state);

  this.__state = state;
  return this[state]();
};

/**
 * Get the current lifecylce state.
 * @return {Lifecycle.states}
 */
Lifecycle.prototype.getState = function()
{
  return this.__state || null;
};

/**
 * Object has been created.
 */
Lifecycle.prototype.onCreate = function() { };

/**
 * Object has started.
 */
Lifecycle.prototype.onStart = function() { };

/**
 * Object is come back from a paused or freshly-started state.
 */
Lifecycle.prototype.onResume = function() { };

/**
 * Object has been requested to pause.
 */
Lifecycle.prototype.onPause = function() { };

/**
 * Object has been stopped.
 */
Lifecycle.prototype.onStop = function() { };

/**
 * Object has been destroyed.
 */
Lifecycle.prototype.onDestroy = function() { };

