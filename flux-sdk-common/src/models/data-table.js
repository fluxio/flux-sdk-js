import { checkDataTable } from '../utils/schema-validators';
import Cell from './cell';
import createWebSocket from '../utils/web-socket-manager';
import {
  dataTableCapabilityPath,
  dataTableWebSocketPath,
  dataTableHistoryPath,
} from '../constants/paths';
import dataTableNotificationTypes, {
  DATA_TABLE_ALL,
  DATA_TABLE_NONE,
} from '../constants/data-table-notification-types';
import {
  UNIFIED,
  SUBSCRIBE,
  DATA_TABLE_SUBCHANNEL,
} from '../constants/web-sockets';
import { authenticatedRequest } from '../utils/request';
import { serializeDataTableMessage } from '../serializers/message-serializer';
import serializeHistory from '../serializers/history-serializer';

const notificationTypeKeys = Object.keys(dataTableNotificationTypes)
  .map(key => dataTableNotificationTypes[key]);

function initializeHandlers() {
  return notificationTypeKeys.reduce((acc, key) => {
    const ret = acc;
    ret[key] = [];
    return ret;
  }, { });
}

function DataTable(credentials, id) {
  checkDataTable({ credentials, id });

  let webSocket = null;
  const handlers = initializeHandlers();
  const capabilityPath = dataTableCapabilityPath(id);
  const historyPath = dataTableHistoryPath(id);

  function onOpenWebSocket() {
    webSocket.send(DATA_TABLE_SUBCHANNEL, {
      type: SUBSCRIBE,
      data: { types: [DATA_TABLE_ALL] },
    });
  }

  function fetchWebSocketPath() {
    return authenticatedRequest(credentials, dataTableWebSocketPath(id), {
      query: { reason: UNIFIED },
    })
      .then(path => path.wsAddr);
  }

  function handleMessage(message) {
    const { type, body } = DataTable.serializeMessage(message);
    handlers[type].forEach(handler => handler(body));
    handlers[DATA_TABLE_ALL].forEach(handler => handler({ type, body }));
  }

  function openWebSocket(options = {}) {
    const { onOpen, ...others } = options;
    const handleOnOpen = onOpen ? () => {
      onOpenWebSocket();
      onOpen();
    } : onOpenWebSocket;
    webSocket = createWebSocket(id, fetchWebSocketPath, {
      onOpen: handleOnOpen,
      ...others,
      credentials,
    });
    webSocket.addHandler(DATA_TABLE_SUBCHANNEL, handleMessage);
    return webSocket;
  }

  function closeWebSocket() {
    if (webSocket) {
      webSocket.send(DATA_TABLE_SUBCHANNEL, {
        type: SUBSCRIBE,
        data: { types: [DATA_TABLE_NONE] },
      });
      webSocket.close();
    }
  }

  function addWebSocketHandler(handler, notificationTypes) {
    const types = [].concat(notificationTypes || DATA_TABLE_ALL);
    types.forEach(type => { handlers[type].push(handler); });
  }

  function removeWebSocketHandler(handler, notificationTypes) {
    const types = notificationTypes ? [].concat(notificationTypes) : notificationTypeKeys;
    types.forEach(type => {
      const index = handlers[type].indexOf(handler);
      if (index !== -1) { handlers[type].splice(index, 1); }
    });
  }

  function sendMessage(message) {
    webSocket.send(DATA_TABLE_SUBCHANNEL, message);
  }

  function fetchCapability() {
    return authenticatedRequest(credentials, capabilityPath);
  }

  function listCells() {
    return Cell.listCells(credentials, id);
  }

  function getCell(cellId) {
    // TODO(daishi): Think about caching Cells instead of creating a new
    // one each time.
    return new Cell(credentials, id, cellId);
  }

  function fetchCell(cellId) {
    return getCell(cellId).fetch();
  }

  function createCell(label, cellOptions) {
    return Cell.createCell(credentials, id, label, cellOptions);
  }

  function updateCell(cellId, options) {
    return getCell(cellId).update(options);
  }

  function deleteCell(cellId) {
    return getCell(cellId).delete();
  }

  function fetchHistory(options = {}) {
    const { cellIds, limit, values, eventTypes, startTime, endTime, page } = options;
    const begin = startTime ? { begin: startTime } : null;
    const end = endTime ? { end: endTime } : null;
    const cursor = page ? { cursor: page.toString() } : null;
    const cells = cellIds ? { cells: cellIds } : null;
    const types = eventTypes ? { types: eventTypes } : null;

    return authenticatedRequest(credentials, historyPath, {
      method: 'post',
      fluxOptions: true,
      body: {
        historyQuery: {
          limit,
          values,
          ...cursor,
          ...begin,
          ...end,
          ...cells,
          ...types,
        },
      },
    })
      .then(DataTable.serializeHistory);
  }

  this.openWebSocket = openWebSocket;
  this.closeWebSocket = closeWebSocket;
  this.addWebSocketHandler = addWebSocketHandler;
  this.removeWebSocketHandler = removeWebSocketHandler;
  this.sendMessage = sendMessage;
  this.fetchCapability = fetchCapability;
  this.listCells = listCells;
  this.getCell = getCell;
  this.fetchCell = fetchCell;
  this.createCell = createCell;
  this.updateCell = updateCell;
  this.deleteCell = deleteCell;
  this.fetchHistory = fetchHistory;
}
DataTable.serializeMessage = serializeDataTableMessage;
DataTable.serializeHistory = serializeHistory;

export default DataTable;
