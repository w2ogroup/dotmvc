var Observable      = require('./Observable');
var Binding         = require('./Binding.js');
var CommandProvider = require('./CommandProvider.js');
var Command         = require('./Command.js');
var Messanger       = require('./Messanger.js');
var log             = require('./util/log.js');
var __mixin         = require('./util/mixin');
var _               = require('underscore');
var $               = require('jquery');

module.exports = View;
__mixin(View, Observable);

// Class attribute on the DOM element
View.CSS_CLASS = '';

// Templating function -- if we have one, the internal DOM will be updated
// (re-written!) every render
View.TEMPLATE  = null;

// Layout function -- if we have one, this will setup the DOM only ONCE in its
// lifetime. Used to skeleton out subviews. Internal DOM identity preserved.
View.LAYOUT    = null;

// Default DOM node (type), if empty, defaults to div and can get injected into
// anything
View.DOM_NODE  = '';

// Chunk of UI. Identic DOM element on which all events are delegated.
// Contains a data context that can cause re-renders on changes, as well has
// have commands delegated to it.
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

  // Messages that we can handle
  this._messages        = [];

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

// Fired off when we want to find a command handler on a view's data context
// or its bubble-able parents' data context
View._REQUEST_COMMAND_HANDLER = 'View::_REQUEST_COMMAND_HANDLER';

// Fired off to propigate messages from context's sendMessage events to this
// and higher views
View._NOTIFY_MESSAGE_SENT = 'View::_NOTIFY_MESSAGE_SENT';

// Let context be a special prop that acts semi like an observable property
Object.defineProperty(View.prototype, 'context', {
  enumerable: true,
  configurable: true,
  get: function() { return this._context; },
  set: function(v) { return this.setDataContext(v); }
});

// Will only be called once. All initial DOM setup and inject should take
// place here
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

  // Listen for command requests that come across our DOM element
  this.$element.on(
    View._REQUEST_COMMAND_HANDLER,
    this._onCommandRequested.bind(this));

  // Listen for message notifications that come accross our DOM element
  this.$element.on(
    View._NOTIFY_MESSAGE_SENT,
    this._onMessageNotify.bind(this));

  this._started = true;
};

// Will be called at any time. All code that updates the visual state
// should go here, knowing that the context's data (or the context itself)
// could be changing
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

// Execute a hash of a command, e.g. {alert: 'message'} from this view.
View.prototype.executeCommand = function(hash)
{
  if (!this.element)
    throw 'Cannot execute a command from a view that has been closed';

  for (var name in hash) {
    var param   = hash[name];
    var command = new Command(this, name, param);
    this.$element.trigger(View._REQUEST_COMMAND_HANDLER, command);
    return command.response;
  }

};

// Handle messages emitted from our data context (or a child view's data
// context and bubbled up)
View.prototype.onMessage = function(hash)
{
  var messages = this._messages;

  for (var message in hash) {
    var handler = hash[message];
    if (messages[message])
      throw 'Cannot have more than one handler for message "' +
        message + '"';
    if (!(handler instanceof Function))
      throw 'Message handler must be a function';

    messages[message] = handler.bind(this);
  }
};

// Append a child view. If it isnt already init-ed, it will init it, and
// call render. It will also listen to all child views
View.prototype.addView = function(view)
{
  if (this._couldHtmlGetClobbered())
    throw 'DOM identity not safe! addView() is dangerous';

  view.render();
  this.element.appendChild(view.element);

  return this;
};

// Given a map of 'jquery selector' -> TView constructor, instantiate the
// view with the DOM set to the first match of the selector, and add it as a
// property to this controller with the key of the constructor name,
// lowercase. THe first parameter is the view in which we are searching for
// shit
View.prototype.createViews = function(map)
{
  if (this._couldHtmlGetClobbered())
    throw 'DOM identity not safe! createViews() is dangerous';

  for (var selector in map) {
    var info = map[selector];
    var domElement = this.$(selector)[0];
    this._createView(domElement, info.View, info.context);
  }
};

// Change teh underlying datacontext of a widget to something else. Any
// observable change events will trigger a re-render
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

    // Any messages emitted from the context should propigate through the DOM
    this.listenTo(context, Messanger.MESSAGE, function(m) {
      if (!m._preventOthers)
        this.$element.trigger(View._NOTIFY_MESSAGE_SENT, [m, this]);
    });
  }

  this._onContextChange();
  return this;
};

// Proxy jqua
View.prototype.$ = function(sel)
{
  return this.$element.find(sel);
};

// Proxy useful shit
View.prototype.addClass = function()
{
  this.$element.addClass.apply(this.$element, arguments);
  return this;
};

// Proxy useful shit
View.prototype.removeClass = function()
{
  this.$element.removeClass.apply(this.$element, arguments);
  return this;
};

// Completely clear out the contents of the view
View.prototype.clear = function()
{
  if (this._isHtmlSacred())
    throw 'Cannot call clear(); DOM identity must be preserved';

  this.element.innerHTML = '';
  return this;
};

// Convenience function
View.prototype.setLayout = function(t)
{
  if (this._started)
    throw 'Cannot change layout after being initialized';

  this.layout = t;
  this.render();
  return this;
};

// Convenience function
View.prototype.setTemplate = function(t)
{
  if (this._started)
    throw 'Cannot change view template after being initialized';

  this.template = t;
  this.render();
  return this;
};


// Delegate events -- can narrow down with a selector, otherwise it ends up
// directly on the object
View.prototype.delegate = function(selector, name, f)
{
  if (arguments.length === 2)
    this.$element.on(selector, name.bind(this));

  this.$element.on(name, selector, f.bind(this));
  return this;
};

// Delegate a DOM event that will trigger a command
View.prototype.delegateCommand = function(selector, name, hash)
{
  this.delegate(selector, name, function() {
    this.executeCommand(hash);
  });
  return this;
};

// View is done!
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

// Where the magic happens for createViewsOn. Uses a hidden method on the
// view to ensure cool shit
View.prototype._createView = function(domElement, TView, context)
{
  var view = new TView(domElement);

  // Use a binding to set the context if provided, otherwise just dump and
  // chump
  if (context instanceof Binding)
    context.setTarget(view, 'context');
  else if (context)
    view.context = context;

  // Ensure dumb views (no context) are rendered and inited
  if (context === null || context === undefined)
    view.render();

  var key = TView.name;
  key = key.charAt(0).toLowerCase() + key.slice(1);
  this[key] = view;
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

// If a command is requested and we can do it, then DO IT, and prevent any
// further bubbling
View.prototype._onCommandRequested = function(e, command)
{
  if (!this._context) return;

  var handled = CommandProvider.attemptExecuteCommand(this._context, command);

  if (!handled) return;

  log(this._context + ' <- ' + command.name + ' - ' + this +
    (this !== command.from ? ' <- ' + command.from : ''));

  e.stopPropagation();
};

// Can we do this message?
View.prototype._onMessageNotify = function(e, m, start)
{
  var message = m.message;
  var from    = m.from;
  var param   = m.param;

  if (!this._messages[message]) return;

  log(m + ' : ' + from + ' - ' + message + ' -> ' + start +
    (start !== this ? ' -> ' + this : ''));

  this._messages[message](param, m);
  e.stopPropagation();
};

// Debug, probably shouldnt be used in general
View.prototype.print = function(s)
{
  this.element.innerHTML += s + '<br>';
  return this;
};

// Formatting
View.prototype.toString = function()
{
  var s = '[View';
  s += this.constructor !== View ?
    '::' + this.constructor.name :
    '';
  s += ' ' + this.id + ']';
  return s;
};
