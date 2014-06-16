module.exports = Binding;

var Backbone   = require('backbone');
var __mixin    = require('typedef').mixin;
var Observable = require('./Observable.js');

__mixin(Binding, Backbone.Events);

// A class that is used to connect a binding Target (such as a UI element) to
// a binding Source (an object that implements WithObservableProperties)
function Binding(source, prop)
{
  this.source        = source;
  this.property      = prop;
  this.valueWhenNull = null;
  this.mode          = Binding.TWO_WAY;

  if (source && prop)
    this.setSource(source, prop);
}

Binding.SOURCE_CHANGE = 'bindingSourceChange';
Binding.TARGET_CHANGE = 'bindingTargetChange';
Binding.ONE_WAY       = 'bindingOneWay';
Binding.TWO_WAY       = 'bindingTwoWay';

// Point the binding at a target / prop pair. If the target is observable, we
// can double bind it
Binding.prototype.setTarget = function(target, prop)
{
  // Start off setting the target and setup event for future changes on this
  // binding, making sure to bind to the target's context to ensure we can
  // unbind later
  var _this = this;
  target[prop] = this.value;
  this.on(
    Binding.SOURCE_CHANGE,
    function() { target[prop] = _this.value; },
    target
  );

  // Two way?
  if (this.mode === Binding.TWO_WAY && target.on) {
    this.listenTo(target, Observable.CHANGE, function() {
      this.value = target[prop];
    });
  }
};

// Unbind events assoicated with updating the target. Target's value wont
// change, but future changes in source will not affect it
Binding.prototype.removeTarget = function(target)
{
  this.off(Binding.SOURCE_CHANGE, null, target);
  this.stopListening(target);
};

// Change the source of data the binding is pointing at
Binding.prototype.setSource = function(source, prop)
{
  if (this.source === source && this.prop === prop) return;
  if (this.source) this.stopListening(this.source);

  if (prop) {
    this.source = source;
    this.property = prop;

    // Determine the actual root of the dot-chain prop we need to listen to
    // know whne a change happens
    var _ref = this._resolve();
    var root = _ref.root;

    this.listenTo(
      this.source,
      Observable.PROPERTY_CHANGE(root),
      function() { this.trigger(Binding.SOURCE_CHANGE); }
    );
  } else {
    this.source = this.property = null;
    if (this.valueWhenNull === source) return;
    this.valueWhenNull = source;
  }

  this.trigger(Binding.SOURCE_CHANGE);
};

// Value function
Object.defineProperty(Binding.prototype, 'value', {
  get: function() {
    if (this.source && this.property) {
      var _ref = this._resolve();
      var source = _ref.source;
      var prop = _ref.property;
      return source ? source[prop] : null;
    } else {
      return this.valueWhenNull;
    }
  },

  set: function(v) {
    if (this.source && this.property) {
      var _ref = this._resolve();
      var source = _ref.source;
      if (!source) return;
      var prop = _ref.property;
      source[prop] = v;
    } else if (this.valueWhenNull !== v) {
      this.valueWhenNull = v;
      this.trigger(Binding.SOURCE_CHANGE);
    }
  }
});

// Resolve any dot-style property into an actual source / property pair
// e.g. 'person.address', 'zip' -> 'address', 'zip'
Binding.prototype._resolve = function()
{
  var source = this.source;
  var property = this.property;
  var parts = property.split('.');
  var root = parts[0];

  for (var index = 0; index < parts.length - 1; index++) {
    var part = parts[index];
    source   = source[part];
    property = parts[index + 1];
  }

  return {
    source: source,
    property: property,
    root: root
  };
};

// Formatting
Binding.prototype.toString = function()
{
  var s = '[Binding ';
  if (this.source && this.property)
    s += ' -> ' + this.source + '#' + this.property;
  else
    s += ' = ' + this.valueWhenNull;
  s += ']';

  return s;
};

