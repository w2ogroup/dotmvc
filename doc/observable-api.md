# Observable API

An object that can have certain properties which, when changed, will cause the
object to emit events.

## Static Functions

<a name="static-observable"></a>
### observable(`propertyMap`)

Create an observable property on the `prototype` property of a constructor.

#### `propertyMap`: { String: *any* }

## Member Functions

<a name="listenTo"></a>
### listenTo(`target`, `event`, `callback`)

Fire off a local member function when another object emits an event. Inversion-of-control from `on`.

#### `target`: Observable

#### `event`: String

#### `callback`: Function (*any*)

<a name="stopListening"></a>
### stopListening(`target`, `event`, `callback`)

Remove all callbacks from another observable object for for events for which we
were listening.

#### `target`: Observable | Object

#### `event`: String

#### `callback`: Function (*any*)

<a name="on"></a>
### on(`event`, `callback`, `context`)

Register a local callback to fire when this object emits an event.

#### `event`: String

#### `callback`: Function (*any*)

#### `context`: Object

<a name="off"></a>
### off(`event`, `callback`, `context`)

Remove the local callback attached to an event.

#### `event`: String

#### `callback`: Function (*any*)

#### `context`: Object

<a name="trigger"></a>
### trigger(`event`, `params`)

#### `event`: String

#### `params`: *any*

Fire an event on this object.

<a name="registerProperty"></a>
### registerProperty(`property`, `value`)

Create an observable property initialized with some value.

#### `property`: String

#### `value`: *any*

<a name="getProperty"></a>
### getProperty(`property`)

Get the current value of an observable property.

#### `property`: String

<a name="setProperty"></a>
### setProperty(`property`, `value`)

Set the current value of an observable property.

#### `property`: String

#### `value`: *any*

<a name="triggerPropertyChange"></a>
### triggerPropertyChange(`property`)

Fire off a event signalling an observable property has changed.

#### `property`: String

<a name="onPropertyChange"></a>
### onPropertyChange(`propertyMap`)

Set callbacks to fire whenever an observable property changes.

#### `propertyMap`: { String: Function(*any*) }
