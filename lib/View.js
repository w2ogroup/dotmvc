var Observable = require('./Observable');
var Binding    = require('./Binding.js');
var log        = require('./util/log.js');
var __mixin    = require('./util/mixin');
var stringy    = require('./util/stringy.js');
var _          = require('underscore');
var $          = require('jquery');

module.exports = View;
__mixin(View, Observable);
__mixin(View, stringy(View));

/**
 * Chunk of UI. Identic DOM element on which all events are delegated.
 * Contains a data context that can cause re-renders on changes, as well has
 * have commands delegated to it.
 * @constructor
 * @param {HTMLElement=} domElement Root DOM node of this view.
 * @param {String=} id Explicitly set this view's ID.
 * @mixes Observable
 * @example
 * var View      = require('dotmvc/lib/View');
 * var __extends = require('dotmvc/lib/util/extends');
 *
 * module.exports = HelloView;
 * __extends(HelloView, View);
 *
 * function HelloView()
 * {
 *   HelloView.Super.apply(this, arguments);
 * }
 *
 * HelloView.prototype.init = function()
 * {
 *   HelloView.Super.prototype.init.apply(this, arguments);
 *   this.delegate('div', 'click', this.onClick);
 * };
 *
 * HelloView.prototype.render = function()
 * {
 *   this.element.innerHTML = '<div>Hello, World!</div>';
 * };
 *
 * HelloView.prototype.onClick = function()
 * {
 *   alert('Clicked!');
 * };
 *
 * ...
 *
 * new HelloView(document.body);
 */
function View(domElement, id)
{
  var T = this.constructor;

  // Allow use to use a jquery object as first argument
  if (domElement instanceof $)
    domElement = domElement[0];

  if (domElement && T.DOM_NODE &&
    domElement.nodeName !== T.DOM_NODE.toUpperCase())
    throw 'View node name mismatch: Expected ' +
      T.DOM_NODE.toUpperCase() + ' but found ' + domElement.nodeName;

  var element = domElement || document.createElement(T.DOM_NODE || 'div');

  if (element.view)
    throw 'Cannot set more than one View to a single DOM element';

  this.id       = id || _.uniqueId('view');
  this.element  = element;
  this.$element = $(element);
  this.template = T.TEMPLATE || null;
  this.layout   = T.LAYOUT || null;

  this._context         = this;
  this._started         = false;
  this._contextChangeId = null;

  // Add the static class name constant to what is already on the DOM
  this.element.className +=
    (this.element.className ? ' ' : '') +
    T.CSS_CLASS;

  // Drop a hidden prop on the DOM element to point back to the "logical"
  // view
  Object.defineProperty(this.element, 'view', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: this
  });
}

/**
 * Class attribute on the DOM element.
 * @const
 */
View.CSS_CLASS = '';

/**
 * Templating function -- if we have one, the internal DOM will be updated
 * (re-written!) every render.
 * @const
 */
View.TEMPLATE  = null;

/**
 * Layout function -- if we have one, this will setup the DOM only ONCE in its
 * lifetime. Used to skeleton out subviews. Internal DOM identity preserved.
 * @const
 */
View.LAYOUT    = null;

/**
 * Default DOM node (type), if empty, defaults to div and can get injected into
 * anything.
 * @const
 */
View.DOM_NODE  = '';

/**
 * The underlying data context. Changing this will cause the view to re-render
 * to update its visual state.
 * @name View.prototype.context
 * @type {Observable}
 */
Object.defineProperty(View.prototype, 'context', {
  enumerable: true,
  configurable: true,
  get: function() { return this._context; },
  set: function(v) { return this.setDataContext(v); }
});

/**
 * Will only be called once. All initial DOM setup and inject should take
 * place here.
 */
View.prototype.init = function()
{
  if (this._started)
    throw 'Cannot init a view more than once';

  // Get DAT DOM up there
  if (this.layout && !this.template) {
    this.element.innerHTML = this.layout(this);
    log (this + ' layout inflated');
  } else if (this.layout && this.template) {
    throw 'Cannot have both a View#layout and View#template';
  }

  this._started = true;
};

/**
 * Will and can be called at any time. All code that updates the visual state
 * should go here, knowing that the context's data (or the context itself)
 * could be changing.
 * @param {Object=} context Override the templating function's context (normally
 * would be the View's data context).
 * @return {View} Return this view.
 */
View.prototype.render = function(context)
{
  if (!this._started) this.init();
  if (!this._started)
    throw 'View not properly initialized before rendering. ' +
      'Was the base init() function called?';
  if (!this.element)
    throw 'Attempting to render ' + this + ' after it has been closed!';

  // If this view is template driven, dump the HTML every time we request a
  // render.
  if (this.template)
    this.element.innerHTML = this.template(context || this);

  log(this + ' rendered');
  return this;
};

/**
 * Append a child view. If it isnt already init-ed, it will init it, and
 * call render. It will also listen to all child views.
 * @param {View} view The child view to add.
 * @return {View} Return this view.
 */
View.prototype.addView = function(view)
{
  if (this._couldHtmlGetClobbered())
    throw 'DOM identity not safe! addView() is dangerous';

  view.render();
  this.element.appendChild(view.element);

  return this;
};

/**
 * Change the underlying data context of a widget to something else. Any
 * observable change events will trigger a re-render. This is equivalent to use
 * the this.context property.
 * @param {Observable|Object|null} context An object to set our data context
 * to.
 * @return {View} Return this view.
 */
View.prototype.setDataContext = function(context)
{
  if (this._context === context) return this;

  log(this + ' data context changed to -> ' + context);

  // Do not listen to ANY events in old context.
  this.stopListening(this._context);
  this._context = context;

  if (context && context.on instanceof Function) {
    // If new context is observable, cause context changes to occur on change
    this.listenTo(context, Observable.CHANGE, this._onContextChange);
  }

  this._onContextChange();
  return this;
};

/**
 * Proxy functions with the jQuery cached element. All jQuery actions and
 * methods should be accessed this way instead of using the global jQuery
 * object. This guarantees we don't accidentally "break out" of the scope of
 * this view.
 * @param {jQuerySelector} sel jQuery selector argument
 * @return {jQuery} The result of the jQuery operation
 * @example
 * this.$.css({ color: 'red' }).show();
 */
View.prototype.$ = function(sel)
{
  return this.$element.find(sel);
};

/**
 * Completely clear out the contents of the view. Will throw an error if there
 * is the risk of clobbering layout-created sub views.
 */
View.prototype.clear = function()
{
  if (this._isHtmlSacred())
    throw 'Cannot call clear(); DOM identity must be preserved';

  this.element.innerHTML = '';
  return this;
};

/**
 * Delegate events a la jquery's on() method. This is how we setup action to
 * fire on DOM events for this view.
 * @param {String} selector jQuery selector string.
 * @param {String} name Event name we want to catch.
 * @param {Function} f Callback handler for when the event is triggered
 * @return {View} Return this view.
 * @example
 * myCoolView.delegate('.save-button', 'click', this.saveUser);
 */
View.prototype.delegate = function(selector, name, f)
{
  this.$element.on(name, selector, f.bind(this));
  return this;
};

/**
 * Create a subview into an existing DOM node
 * @param {jQuerySelector} selector jQuery selector that we use to locate the
 * DOM node we want to create the view on. Will be the first element found with
 * this selector.
 * @param {Function} TView View class we want to use to create thew new
 * view instance.
 * @param {Object|Binding} context Static data context we want to set the new
 * view to, OR a Binding isntance that we can use to set the target of.
 */
View.prototype.createView = function(selector, TView, context)
{
  if (this._couldHtmlGetClobbered())
    throw 'DOM identity not safe! createViews() is dangerous';

  var view = new TView(domElement);

  // Use a binding to set the context if provided, otherwise just dump and
  // chump
  if (context instanceof Binding)
    context.setTarget(view, 'context');
  else if (context)
    view.

  // Init and draw the first one
  view.render();

  return view;
};


/**
 * Remove this view. Cleans up all event listeners and removes itself from the
 * DOM. A closed view cannot be used anymore.
 */
View.prototype.close = function()
{
  this.stopListening();
  this.$element.off();
  this.element.parentNode.removeChild(this.element);
  delete this.element.view;
  this.element = undefined;
  log(this + ' closed');
};

// Returns true if HTML DOM identity is NOT SAFE!
View.prototype._couldHtmlGetClobbered = function()
{
  return !!this.template;
};

// Returns true if the internior HTML should never change
View.prototype._isHtmlSacred = function()
{
  return !!this.layout;
};

// When the context changes, propigate the change event and render ourselves
View.prototype._onContextChange = function()
{
  this.triggerPropertyChange('context');

  if (this._contextChangeId) {
    global.clearTimeout(this._contextChangeId);
  }

  var _this = this;
  this._contextChangeId = global.setTimeout(function() {
    _this._contextChangeId = null;
    _this.render();
  });
};

// Debug, probably shouldnt be used in general
View.prototype.print = function(s)
{
  this.element.innerHTML += s + '<br>';
  return this;
};

