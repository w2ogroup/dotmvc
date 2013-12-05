# View API

A chunk of UI.

## Member Functions

<a name="init"></a>
### init()

Sets up the view's DOM components.

<a name="render"></a>
### render(`context`)

Update the view's visual component.

#### `context`: Object || *null*

The render method will, by default, call the templating function for either the
*layout* or *template* with the `View` object as the argument unless an
optional, truthy `context` parameter is supplied.

<a name="executeCommand"></a>
### executeCommand(`commandMap`)

Fire off a command that may be handled by a data context bound to a view
further up in the DOM heirarchy.

#### `commandMap`: { String: Object | *null* }

<a name="addView"></a>
### addView(`view`)

Append a view inside of this one.

#### `view`: View

<a name="createViews"></a>
### createViews(`subviewMap`)

Instantiate one or more subviews on existing internal DOM nodes to this view.

<a name="setDataContext"></a>
### setDataContext(`context`)

Change the view's bound data context.

#### `context`: Observable | Object | *null*

<a name="setTemplate"></a>
### setTemplate(`template`)

Change or set a view's template. Cannot be called after a view has been
`init()`ed, howver.

#### `template`: function(Object | null) -> String

<a name="setLayout"></a>
### setLayout(`layout`)

Change or set a view's layout. Cannot be called after a view has been
`init()`ed, howver.

#### `layout`: Function (Object | *null*) -> String

<a name="delegate"></a>
### delegate(`selector`, `event`, `callback`)

Setup an event listen on the root DOM node that will respond to events in its
children.

#### `selector`: jQuerySelector

#### `event`: String

#### `callback`: Function(jQueryEvent)

<a name="delegateCommand"></a>
### delegateCommand(`selector`, `event`, `commandMap`)

Shortcut to using `delegate()` to call `executeCommand()`.

#### `selector`: jQuerySelector

#### `event`: String

#### `commandMap`: { String: Object | *null* }

<a name="close"></a>
### close()

Destroy the view.

