# Observable API

An object that can have certain properties which, when changed, will cause the
object to emit events.

## Static Functions

<a name="static-observable"></a>
### observable(`propertyMap`)

Create an observable property on the `prototype` property of a constructor.

#### `propertyMap`: { String: *any* }

## Member Functions

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
