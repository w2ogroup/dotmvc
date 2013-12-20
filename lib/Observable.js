var __mixin  = require('./util/mixin.js');
var Backbone = require('backbone');

module.exports = Observable;
__mixin(Observable, Backbone.Events);

/**
 * Basic mixin that handles standardized singalling for properties being set
 * and changing. This defines the low-level event semantics used for observable
 * objects. It also provides the mechanism for elevating an object property to
 * a get/set combo that will fire events are property changes automatically.
 * @mixin
 * @example
 * var Observable = require('dotmvc/lib/Observable');
 * var __mixin    = require('dotmvc/lib/util/mixin');
 *
 * module.exports = Person;
 * __mixin(Person, Observable);
 *
 * function Person()
 * {
 *
 * }
 *
 * Person.observable({
 *   name: 'John Doe',
 *   age: 27
 * });
*/
function Observable()
{

}

/**
 * This observable has changed
 * @event
 */
Observable.CHANGE = 'change';

/**
 * Install an observable property onto an object. Will overwrite the property
 * with the needed get/set methods, and setup another private method to store
 * the actual property.
 * @example
 * var person = {name: 'Brandon'};
 * Observable.registerProperty(person, 'name');
 * @param {Object} obj Target object to install the observable one.
 * @param {String} prop Property name of the observable.
 * @param {*=} val Initial value of the observable property.
 */
Observable.registerProperty = function(obj, prop, val)
{
  var _prop = '_' + prop;

  // Ensure that we have the appropriate hidden trackers on an object for
  // resolving dependencies
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
      },
    });

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

/**
 * Get access to an observable property, tracking access along the way.
 * @param {String} prop Property name to get.
 * @return {*} The value of the property.
 */
Observable.prototype.getProperty = function(prop)
{
  this._trackAccess(prop);
  return this['_' + prop];
};

/**
 * Set an obsvervable property, tracking any necesary information about
 * dependencies as we go.
 * @param {String} prop Property name.
 * @param {*} val Property value.
 * @fires Observable.CHANGE
 * @fires Observable.PROPERTY_CHANGE
 */
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

/**
 * Static method to cleanly install observable properties on a class's prototype.
 * @example
 * MyObservableObject.observable({
 *   someProp: 123,
 *   anotherProp: true
 * });
 * @param {Object.<String,*>} hash Map of property names to initial values.
 */
Observable.observable = function(hash)
{
  if (this === Observable)
    throw 'cannot call observable on Observable';
  for (var prop in hash) {
    var val = hash[prop];
    Observable.registerProperty(this.prototype, prop, val);
  }
};

/**
 * Fire a property change notification. Always use this function to manually
 * trigger a property change.
 * @param {String} prop Name of the property that changed.
 * @fires Observable.CHANGE
 * @fires Observable.PROPERTY_CHANGE
 */
Observable.prototype.triggerPropertyChange = function(prop)
{
  this.trigger(Observable.PROPERTY_CHANGE(prop));
  this.trigger(Observable.CHANGE);
};

/**
 * Helper for listening to property changes. All callbacks are bound to
 * Observable object calling this function (autobound this)
 * @example
 * // Fire off this.sayName whenever our name property changes
 * myObservable.onPropertyChange({ name: this.sayName });
 * @param {String} prop Property name we want to listen for changes on.
 * @param {function()} f Handler for when the property changes.
 */
Observable.prototype.onPropertyChange = function(prop, f)
{
  if (f)
    this.on(Observable.PROPERTY_CHANGE(prop), f);
  else
    for (var key in prop)
      this.on(Observable.PROPERTY_CHANGE(key), prop[key]);
};

/**
 * A specific property has changed on this object
 * @param {String} prop Name of the property that has changed.
 * @event
 */
Observable.PROPERTY_CHANGE = function(prop)
{
  return Observable.CHANGE + ':' + prop;
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

