var Resolver  = require('../Resolver.js');
var Router    = require('../Route.js');
var Lifecycle = require('../Lifecycle.js');

module.exports = ActivityService;

/**
 * An applicaiton service that manages the activity stack and the stage
 * transitions as activities come and go.
 * @constructor
 * @param {Resolver} resolver
 * @param {Router} router
 */
function ActivityService(resolver, router)
{
  router.addHandler(this);
  resolver.register('activityService', this);

  this.resolver = resolver;
  this._stack = [];
}

/**
 * An action that will activate an Activity for the user.
 * @constructor
 * @param {Function} Activity Constructor function for the activity.
 * @param {Object=} bundle Data to pass to the activity.
 */
ActivityService.ActivityAction = ActivityAction;
function ActivityAction(Activity, bundle)
{
  this.Activity = Activity;
  this.bundle   = bundle || {};
}

/**
 * @param {Lifecycle} activity
 */
ActivityService.prototype.finishActivity = function(activity)
{
  var states = Lifecycle.states;
  var stack  = this._stack;

  // Advance through the SM
  if (activity.getState() === states.RESUME)
    activity.changeState(states.PAUSE);
  else if(activity.getState() !== states.PAUSE)
    return;
  activity.changeState(states.STOP);
  activity.changeState(states.DESTROY);

  // find in stack
  var index = stack.indexOf(activity);
  if (!~index) return;

  // If top, bring up lower
  if (index && index === stack.length - 1) {
    var next = stack[stack.length - 2];
    next.changeState(states.RESUME);
  }

  this._stack.splice(index, 1);
};

/**
 * @param {ActivityAction} response
 */
ActivityService.prototype.onAction = function(action, args)
{
  if (!(action instanceof ActivityAction)) return;
  var T = action.Activity;

  // Guess we need to make, fire it up
  var activity = this._make(T);

  // Pause previous if there is one
  var last = this._peek();
  if (last) {
    last.changeState(Lifecycle.states.PAUSE);
  }

  activity.changeState(Lifecycle.states.CREATE);
  activity.changeState(Lifecycle.states.START);
  activity.changeState(Lifecycle.states.RESUME);

  this._stack.push(activity);

  // Through the activity out as a response
  return activity;
};

ActivityService.prototype._peek = function()
{
  var stack = this._stack;
  if (!stack.length) return null;
  return stack[stack.length - 1];
};

ActivityService.prototype._make = function(T)
{
  var activity = this.resolver.make(T);
  if (!Lifecycle.isLifecycled(activity))
    throw 'Activity must implement Lifecycle interface';
  return activity;
};

