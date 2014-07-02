module.exports = Observable;

var __mixin  = require('typedef').mixin;
var Backbone = require('backbone');

__mixin(Observable, Backbone.Events);

Observable.CHANGE = 'change';
Observable.ADD    = 'add';
Observable.CLEAR  = 'clear';
Observable.REMOVE = 'remove';
Observable.SET    = 'set';

// Basic mixin that handles standardized singalling for properties being
// set and changing. This defines the low-level event semantics used for
// observable objects. It also provides the mechanism for elevating an object
// property to a get/set combo that will fire events are property changes
// automatically.
function Observable()
{
  // Can be instantiated as an object, but is typically best used as a mixin
}

// Create an observable property prop on obj. Will initialize with val if
// provided, otherwise it will start with whatever is already in prop. Also
// creates a hidden property _prop
Observable.registerProperty = function(obj, prop, val)
{
  var _prop = '_' + prop;
  _ensureTrackers(obj);

  // Create the private hidden member, either as a normal value or a
  // getter/setter in the case of a function (computed value)
  var descriptor = {
    enumerable: false,
    configurable: true
  };
  if (val instanceof Function) {
    descriptor = {
      enumberable: false,
      configurable: true,
      get: function() { return this._getComputedValue(prop, val); }
    };
  } else {
    descriptor = {
      enumberable: false,
      writable: true,
      configurable: true,
      value: val !== undefined ? val : obj[prop]
    };
  }

  // Create hidden actual value
  Object.defineProperty(obj, _prop, descriptor);

  // create getters and setters that trigger events
  Object.defineProperty(obj, prop, {
    enumberable: true,
    configurable: true,
    get: function() { return this.getProperty(prop); },
    set: function(val) { return this.setProperty(prop, val); }
  });
};

// Instance version of registerProperty
Observable.prototype.registerProperty = function(p, v)
{
  return Observable.registerProperty(this, p, v);
};

// Ensure that we have the appropriate hidden trackers on an object for
// resolving dependencies
function _ensureTrackers(obj)
{
  if (!obj.__frames || !obj.__deps)
    Object.defineProperties(obj, {
      __frames: {
        enumerable: false,
        configurable: true,
        writable: false,
        value: []
      },
      __deps: {
        enumerable: false,
        configurable: true,
        writable: false,
        value: {}
      }
    });
}

// Get access to an observable property, tracking access along the way
Observable.prototype.getProperty = function(prop)
{
  this._trackAccess(prop);
  return this['_' + prop];
};

// Set an obsvervable property, tracking any necesary information about
// dependencies as we go
Observable.prototype.setProperty = function(prop, val)
{
  this._trackAccess(prop);
  var _prop = '_' + prop;
  var oldVal = this[_prop];
  if (val === oldVal) return;

  // Stop listening to the old value and proxy up change on our new one
  var _this = this;
  if (oldVal && oldVal.off) this.stopListening(oldVal, Observable.CHANGE);
  if (val && val.on) this.listenTo(
    val,
    Observable.CHANGE,
    function() { _this.triggerPropertyChange(prop); }
  );

  this[_prop] = val;
  this.triggerPropertyChange(prop);
  this._triggerDependencies(prop);
};

// Coffee-style annotations (e.g., @observable name: 'John')
Observable.observable = function(hash)
{
  if (this === Observable)
    throw 'cannot call observable on Observable';
  for (var prop in hash) {
    var val = hash[prop];
    Observable.registerProperty(this.prototype, prop, val);
  }
};

// Run a member function whilst tracking all deps
Observable.prototype._getComputedValue = function(prop, fn)
{
  // Fill the frame will all the accessed values and record them as
  // dependencies for this property
  this.__frames.push([]);
  var val = fn.call(this);
  this.__deps[prop] = this.__frames.pop();
  return val;
};

// Mark access to a property by recording it in the top-most frame
Observable.prototype._trackAccess = function(prop)
{
  var frames = this.__frames;
  if (!frames.length) return;

  frames[frames.length -1].push(prop);
};

// Recursively determine all dependencies of a property
Observable.prototype._getDependencies = function(prop)
{
  var deps = this.__deps[prop];

  // Trivial case, no deps, only itself
  if (!deps) return [prop];

  // The dependencies of prop are the dependencies of its deps, recusively
  var ret = [];
  for (var n = 0; n < deps.length; n++) {
    var p = deps[n];
    ret = ret.concat(this._getDependencies(p));
  }

  return ret;
};

// Sick
Observable.prototype._expandDependencies = function(deps)
{
  var ret = [];
  for (var n = 0; n < deps.length; n++) {
    var p = deps[n];
    ret = ret.concat(this._getDependencies(p));
  }
  return ret;
};

// Fire off all depedent property change events
Observable.prototype._triggerDependencies = function(prop)
{
  for (var p in this.__deps) {
    var deps = this.__deps[p];
    deps = this._expandDependencies(deps);
    if (~deps.indexOf(prop))
      this.triggerPropertyChange(p);
  }
};

// Fire a property change notification. The object hat mixes in Observable
// should use this function to signal that something has changed.
Observable.prototype.triggerPropertyChange = function(prop)
{
  this.trigger(Observable.PROPERTY_CHANGE(prop));
  this.trigger(Observable.CHANGE);
};

// Helper for listening to property changes
Observable.prototype.onPropertyChange = function(prop, f)
{
  if (f)
    this.on(Observable.PROPERTY_CHANGE(prop), f);
  else
    for (var key in prop)
      this.on(Observable.PROPERTY_CHANGE(key), prop[key]);
};

// Return the event name for a property change
Observable.PROPERTY_CHANGE = function(prop)
{
  return Observable.CHANGE + ':' + prop;
};
