module.exports = ObservableList;

var Observable = require('./Observable.js');
var __mixin    = require('./util/mixin.js');
var _          = require('underscore');

__mixin(ObservableList, Observable);

function ObservableList(items)
{
  this._items = _(items).toArray();
}

// Add new item to the collection. Will push it onto the stack, listen for
// changes to rebroadcast, and fire off change events
ObservableList.prototype.add = function(item)
{
  this._items.push(item);
  this.trigger(Observable.ADD, item);
  this.trigger(Observable.CHANGE, item);

  // Proxy events if we can
  if (item.on)
    this.listenTo(item, Observable.CHANGE, function() {
      this.trigger(Observable.CHANGE, item);
    });

  return this;
};

// Remove all items, triggers a clear event. does NOT triggere a remove event
// for all objects
ObservableList.prototype.clear = function()
{
  this.stopListening();
  this._items = [];
  this.trigger(Observable.CLEAR);
  this.trigger(Observable.CHANGE);

  return this;
};

// Given an index, remove an item and fire off events
ObservableList.prototype.removeAt = function(index)
{
  if (index >= this._items.length) return this;
  var obj = this._items[index];
  this.trigger(Observable.REMOVE, obj);
  this._items.splice(index, 1);
  this.stopListening(obj);
  this.trigger(Observable.CHANGE);
  return this;
};

// Remove the first instance of a particular item
ObservableList.prototype.remove = function(item)
{
  var index = this._items.indexOf(item);
  if (!~index) return this;
  return this.removeAt(index);
};

// Remove all instances of an item
ObservableList.prototype.removeAll = function(item)
{
  var _ref = this._items.length;
  for (var n = 0; n < _ref; n++) {
    var x = this._items[n];
    if (x !== item) continue;
    this._items.splice(n, 1);
    _ref--;
    n--;
  }

  if (item.off) this.stopListening(item);
  this.trigger(Observable.REMOVE, item);
  this.trigger(Observable.CHANGE);
  return this;
};

// Item at specific index
ObservableList.prototype.get = function(index)
{
  return this._items[index];
};

// Index of the first location of an item
ObservableList.prototype.indexOf = function(item)
{
  return this._items.indexOf(item);
};

// Total number of items
ObservableList.prototype.count = function()
{
  return this._items.length;
};

// Array each
ObservableList.prototype.each = function(f)
{
  this._items.forEach(f);
  return this;
};

// ARray map
ObservableList.prototype.map = function(f)
{
  return new ObservableList(this._items.map(f));
};

// Array filter
ObservableList.prototype.filter = function(f)
{
  return new ObservableList(this._items.filter(f));
};

// ARrray reduce
ObservableList.prototype.reduce = function(f)
{
  return this._items.reduce(f);
};
