# Serialization

By default, the Flux SDK does some massages of the data that it gets from the
API. This helps keep responses simpler and more consistent, as well as providing
some level of future-proofing.

To **restore original behaviour**, simply replace the serializer with an
identity function. For example:

```js
Cell.serialize = function(response) { return response; }
```

To **override** a serialization, replace it with whatever else you want. For
example:

```js
Cell.serialize = function(response) {
  return {
    cellId: response.CellId,
    // other things
  };
}
```

You can also base your own serializer off of the existing behaviour. For
example:

```js
var originalCellListSerializer = CellList.serializeList;

Cell.serializeList = function(response) {
  var serializedCells = originalCellListSerializer(response);
  return serializedCells.entities;
}
```
