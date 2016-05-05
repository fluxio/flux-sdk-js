# DataTable

Instance methods:

* [constructor](./DataTable.md#constructor)
* [fetchCapability](./DataTable.md#fetchcapability)
* [getCell](./DataTable.md#getcell)
* [fetchCell](./DataTable.md#fetchcell)
* [listCells](./DataTable.md#listcells)
* [createCell](./DataTable.md#createcell)
* [openWebSocket](./DataTable.md#openwebsocket)
* [closeWebSocket](./DataTable.md#closewebsocket)
* [addWebSocketHandler](./DataTable.md#addWebSocketHandler)
* [removeWebSocketHandler](./DataTable.md#removeWebSocketHandler)
* [sendMessage](./DataTable.md#sendMessage)

Static properties:

* [serializeMessage](./DataTable.md#serializeMessage)
* [constants](./DataTable.md#constants)

## Instance Methods

### <a id="constructor"></a>constructor: `DataTable(credentials, id)`

#### Arguments

1. `credentials` *([Credentials](../Glossary.md#credentials))*: Valid
credentials corresponding to the current user
1. `id` *(String)*: The data table's ID. Currently, each data table uses its
parent project's ID.

#### Returns

*(DataTable)* A DataTable instance

### <a id="fetchcapability"></a>`fetchCapability()`

#### Returns

TODO

### <a id="getcell"></a>`getCell(cellId)`

See [Cell#constructor](./Cell.md#constructor)

```js
new DataTable(credentials, dataTableId).getCell(cellId)
```

is equivalent to

```js
new Cell(credentials, dataTableId, cellId)
```

### <a id="fetchcell"></a>`fetchCell(cellId)`

See [Cell#fetch](./Cell.md#fetch)

```js
new DataTable(credentials, dataTableId).fetchCell(cellId)
```

is equivalent to

```js
new Cell(credentials, dataTableId, cellId).fetch()
```

### <a id="listcells"></a>`listCells()`

See [Cell#listCells](./Cell.md#listcells)

```js
new DataTable(credentials, dataTableId).listCells()
```

is equivalent to

```js
Cell.listCells(credentials, dataTableId)
```

### <a id="createcell"></a>`createCell(label, options)`

See [Cell#createCell](./Cell.md#createcell)

```js
new DataTable(credentials, id).createCell(label, options)
```

is equivalent to

```js
Cell.createCell(credentials, id, label, options)
```

### <a id="openwebsocket"></a>`openWebSocket(options)`

Opens a web socket that can be used to communicate about the data table's
events, such as when cells belonging to the data table are modified.

#### Arguments

1. `options` *(Object = `{ onOpen: Function, onError: Function, pingTimeout:
Number, errorTimeout: Number, reconnectDelay: Number,
delayMultiplier: Number }`)*

  `onOpen`: A callback that will be triggered when the web socket connects or
  reconnects

  `onError`: A callback that will be triggered when the web socket fails to
  connect or reconnect after a certain time (the `errorTimeout`). For example,
  you may want to tell the user to check the Internet connection. **If an
  `onError` callback is not provided, this will throw an error.**

  `pingTimeout` (default: `30000`): How long to wait before reconnecting if the
  server does not send a PING message

  `errorTimeout` (default: `600000`): How long to wait after the first
  connection failure before calling the `onError` callback

  `reconnectDelay` (default: `5000`): How long to wait between attempts to
  reconnect. This will be multiplied by the `delayMultiplier` after each failed
  attempt

  `delayMultiplier` (default: `1.2`): How much to increase the delay each time
  there is a failed connection attempt

### <a id="closewebsocket"></a>`closeWebSocket()`

Closes the web socket, if a web socket has been opened for the data table.

### <a id="addwebsockethandler"></a>`addWebSocketHandler(handler,s [notificationTypes])`

Adds a handler that will be called when the data table's web socket receives a
new message.

**The web socket must be opened separately. Handlers are maintained if and when
the web socket is closed and reopened.**

#### Arguments

1. `handler` *(Function)*: The handler to be called when the web socket receives
a relevant message type
1. `notificationTypes` *(String | String[] - default:
[`DATA_TABLE_ALL`](DataTable.md#constants))*: The type or types of notifications
that should trigger the handler. If `DATA_TABLE_ALL` and another type are both
supplied, the handler will be triggered multiple times - once per requested
type.

Handlers will be called with
[serialized messages](DataTable.md#serializeMessage). **Handlers registered with
specific notification types receive just the `body` value of the payload.
Handlers registered with `DATA_TABLE_ALL` receive the full payload, including
`type` and `body`.**

### <a id="removewebsockethandler"></a>`removeWebSocketHandler(handler, [notificationTypes])`

Removes a handler, such that it will no longer be called when the data table's
web socket receives messages.

#### Arguments

1. `handler` *(Function)*: The handler to be removed
1. `notificationTypes` *(String | String[])*: The type or types of notifications
for which the handler should no longer be called. If no types are supplied, the
handler will be removed completely.

### <a id="sendmessage"></a>`sendmessage(message)`

Sends a message to the data table's web socket.

**The web socket must be opened separately. `sendMessage` will raise an error if
the web socket has not been opened yet.**

#### Arguments

1. `message` *(Object | String | Number)*: The message to be sent

## Static Properties

### <a id="serializemessage"></a>`serializeMessage`

TODO

### <a id="constants"></a>`constants`

TODO
