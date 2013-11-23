# Binding API

## Member Functions

<a name="setTarget"></a>
### setTarget(`target`, `property`)

Set the target object and property of the binding. The target(s) will remain in
sync with the source.

#### `target`: Observable | Object

#### `property`: String

<a name="setSource"></a>
### setSource(`source`, `property`)

Set the source object and property of the binding. All targets will by synced
with the source.

#### `source`: Observable | Object

#### `property`: String

<a name="removeTarget"></a>
### removeTarget(`target`)

Remove an object from the targets a binding currently has.

#### `target`: Observable | Object
