import DataTable from './data-table';
import { authenticatedRequest } from '../utils/request';
import {
  cellsPath,
  cellPath,
} from '../constants/paths';
import { checkCell } from '../utils/schema-validators';
import {
  serialize,
  serializeDelete,
  serializeList,
} from '../serializers/cell-serializer';

// Ensure all keys have leading caps.
// TODO(daishi): Move this to some utility module or possibly use a third-party
// library like https://github.com/domchristie/humps.
function capcaseKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const ret = acc;
    ret[key.replace(/^[a-z]/, match => match.toUpperCase())] = obj[key];
    return ret;
  }, {});
}

function updateCell(credentials, dataTableId, id, keyOptions = {}) {
  const { value, ...others } = keyOptions;

  const clientMetadata = capcaseKeys(others);
  // TODO(daishi): Generalize functionality to not assume client metadata
  // capability (this issue exists elsewhere also).
  const fluxOptions = {
    Metadata: true,
    ClientMetadata: clientMetadata,
  };

  return authenticatedRequest(credentials, cellPath(dataTableId, id), {
    body: value,
    method: 'post',
    fluxOptions,
  })
    .then(Cell.serialize);
}

function listCells(credentials, dataTableId) {
  return authenticatedRequest(credentials, cellsPath(dataTableId), {
    fluxOptions: true,
  })
    .then(Cell.serializeList);
}

function createCell(credentials, dataTableId, label, keyOptions = {}) {
  return updateCell(credentials, dataTableId, '', { label, ...keyOptions });
}

function Cell(credentials, dataTableId, id) {
  checkCell({ credentials, dataTableId, id });

  const dataTable = new DataTable(credentials, dataTableId);
  const path = cellPath(dataTableId, id);
  const fluxOptions = {
    Metadata: true,
    ClientMetadata: true,
  };

  function fetch() {
    return authenticatedRequest(credentials, path, { fluxOptions })
      .then(Cell.serialize);
  }

  function update(keyOptions) {
    return updateCell(credentials, dataTableId, id, keyOptions);
  }

  function deleteCell() {
    return authenticatedRequest(credentials, path, {
      fluxOptions,
      method: 'delete',
    })
      .then(Cell.serializeDelete);
  }

  function fetchHistory(options) {
    return dataTable.fetchHistory({
      cellIds: [id],
      ...options,
    });
  }

  this.fetch = fetch;
  this.update = update;
  this.delete = deleteCell;
  this.fetchHistory = fetchHistory;
}

Cell.listCells = listCells;
Cell.createCell = createCell;
Cell.serialize = serialize;
Cell.serializeDelete = serializeDelete;
Cell.serializeList = serializeList;

export default Cell;
