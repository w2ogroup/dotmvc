# Dot MVC

[![Build Status](https://travis-ci.org/bvalosek/dotmvc.png?branch=master)](https://travis-ci.org/bvalosek/dotmvc)
[![NPM version](https://badge.fury.io/js/dotmvc.png)](http://badge.fury.io/js/dotmvc)

A tiny, sensible, client-side MVC framework in modern Javascript.

# How To Use

**Dot MVC** is meanet to be used with [Browserify](http://browserify.org/), so
install it with `npm`:

```
npm install dotmvc
```

# API

This is not a comprehensive API listing, just the most important parts.

## View

Single chunk of UI. Handles template rendering, DOM event handling, and command
delegation.

### Code Example

```javascript
var View = require('dotmvc/lib/View');

module.exports = (function() {
  __extends(NavigationView, View);

  NavigationView.CSS_CLASS = 'navigation-bar';
  NavigationView.TEMPLATE  = require('./nav-bar.hbs');

  // Constructor
  function NavigationView()
  {
    _super.apply(this, arguments);
  }

  // Initialize our DOM events
  NavigationView.prototype.init = function()
  {
    _super.prototype.init.apply(this, arguments);

    this.delegate('button', 'click', this.onNavClick);
  };

  // When the user presses a navigation button
  NavigationView.prototype.onNavClick = function(event)
  {
    var slug = $(event.target).data('slug');
    this.executeCommand({ navigateTo: slug });
  };

})();
```

### `static` LAYOUT

### `static` TEMPLATE

Templating function to be used for this view. Can be any templating engine so
long as it has the following function signature:

```
f(dataContext) -> String
```

(A function that generates an HTML string when called with a single-argument
data context).

### `static` CSS_CLASS

The initial CSS class the view root will start with. This will be in addition
to 'view'.

### element / $element

The native DOM element root and the cached jQuery-wrapped element.

### context

The underlying data context. By default, it is set to the view itself, but it
should be set (or bound) to something more interesting in order to power the
view from a more abstracted interaction model.

The data context is the paramter passed to the templating function on render as
well as the object that handles any commands that bubble up to the view.

### init()

Called automatically only a single time when the view is ready to be used, does
not usually ever have to be called manually. This method should be overriden
(while still calling the base method) to setup any delegated events.

### render()

Potentailly called several times, by default injects the HTML generated by the
template into the view root.

### executeCommand(`commandMap`)

Fire off a command on the view that will propagate up and (potententially) get handled in another context.

*Commands are handled via methods on a view's data context*. The command
effectively bubbles up the DOM from the originating view until it encounters a
view whose data context can handle said command.

Example:

```javascript
this.executeCommand({ alert: 'some message!' });
```

### addView(`view`)

Append a view inside of another view. All this really does is to move `view`'s
DOM element inside of another view's DOM element.

### $(`selector`)

Convenience function for `view.$element.find()` that let's you quickly call
jQuery functions on a view's root.

### delegate(`selector`, `event`, `handler`)

Create a delegated event handler (via jQuery's `on()` method) for the view.

Example:

```javascript
this.delegate('.back-button', 'click', this.onBackClick);
```

### delegateCommand(`selector`, `event`, `commandMap`)

A shortcut for the combination of `delegate()` and `executeCommand`.

Example:

```javascript
this.delegateCommand('.alert-button', 'click', { alert: 'some message!' });
```

### close()

Kill off everything for this view, including de-coupling the references to the
DOM and physically removing the native node from the document.

All interactive functions will throw errors (such as `render()` and
`delegate()`) if called after a view has been closed.

## Controller

Top-level entry methods for handling route requests. Responsible for
instantiating the needed views and underlying domain models, as well as wiring
them up.

### window

### load()

### unload()

### index()

### createViewsOn(`view`, `map`)

Useful utility function that allows for easy setup of multiple subviews and
data binding.

The `map` parameter is a hash mapping jQuery selectors to info that specify a
`View` constructor and a `context` parameter. If `context` is a `Binding`
object, then the binding will be set to target the view's `context` paramter.

The first entry of the `map` parameter below will result in the following:
"Create a new `WidgetArea` view object whose identic DOM element is found by
'.widget-container', and bind its data context to `this.dashboard.widgetList`."

```javascript
this.createViewsOn(this.layout, {
  '.widget-container': {
    View: WidgetArea,
    context: new Binding(this.dashboad, 'widgetList')
  },
  '.about-button': {
    View: InfoView,
    context: this.dashboard
  }
});
```

## Application

Singleton that bootstraps the application and routes the initial request.
Handles all cross-control concerns such as navigation and controller
lifecycling.

### start()

### navigate(`url`)

# Testing

This is some test coverage for a few of the low-level data structures used in
**Dot MVC**.

Testing requires [node/npm](http://nodejs.org) and
[grunt-cli](https://github.com/gruntjs/grunt-cli) to be installed on your
system.

To install all the dev dependencies and run `grunt`:

```
npm install
grunt
```

# License
Copyright 2013 Brandon Valosek

**Dot MVC** is released under the MIT license.

