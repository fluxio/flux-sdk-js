# Cell

Instance methods:

* [constructor](./Cell.md#constructor)
* [fetch](./Cell.md#fetch)
* [update](./Cell.md#update)
* [delete](./Cell.md#delete)

Static methods and properties:

* [listCells](./Cell.md#listcells)
* [createCell](./Cell.md#createcell)
* [serialize](./Cell.md#serialize)
* [serializeList](./Cell.md#serializelist)

## Instance Methods

### <a id="constructor"></a>constructor: `Cell(credentials, dataTableId, id)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user
1. `dataTableId` *(String)*: The ID of the data table that the cell belongs to
1. `id` *(String)*: The cell's ID

#### Returns

*(Cell)* A Cell instance

### <a id="fetch"></a>`fetch`

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Cell.md#serialize) API
response

**WARNING: Some cells may have very large values, and so this can be a large
request!**
<!--TODO explain some more-->

### <a id="update"></a>`update(options)`

#### Arguments

1. `options` *(Object = `{ label: String, description: String, value: Object |
Array | Number | String | null }`*

  `label`: If provided, updates the cell's label

  `description`: If provided, updates the cell's description

  `value`: If provided, updates the cell's value. *The value must be
  serializable as JSON, e.g., it cannot included functions.*

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Cell.md#serialize) API
response

### <a id="delete"></a>`delete()`

#### Returns

TODO

## Static Methods and Properties

### <a id="listcells"></a>`listCells(credentials)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Cell.md#serializelist) API
response

### <a id="createcell"></a>`createCell(credentials, label, [options])`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user
1. `label` *(String)*: The name of the new cell
1. `options` *(Object = `{ description: String, value: Object | Array | String |
Number | null }`)*

  `description`: If provided, sets the cell's description

  `value`: If provided, updates the cell's value. *The value must be
  serializable as JSON, e.g., it cannot included functions.*

#### Returns

`(Promise --> Object)` Resolves to the [serialized](Cell.md#serializelist) API
response

### <a id="serialize"></a>`serialize`

Set to override how the SDK serializes single-entity project API responses, such
as `Cell.createCell`.

By default, this will return an `Object` with the structure:

```js
type CellResponse = {
  id: String,
  label: String,
  description: String,
  size: Number,
  timeUpdated: Date,
  locked: Boolean,
  authorId: String,
  authorName: String,
  clientId: String,
  clientName: String,
  ?value: Object | Array | String | Number | null
}
```

**NOTE:** Currently, only `Cell.#fetch` returns `value`.

See [Serialization](../advanced/Serialization.md) for more information.

### <a id="serializelist"></a>`serializeList`

Set to override how the SDK serializes multiple-entity project API responses,
such as `Cell.listCells`.

By default, this will return an `Object` with the structure:

```js
type CellssResponse = {
  entities: CellResponse[],
}
```

See [Serialization](../advanced/Serialization.md) for more information.
