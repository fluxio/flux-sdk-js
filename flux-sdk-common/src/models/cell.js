import { camelizeKeys, pascalizeKeys } from 'humps';

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

function updateCell(credentials, dataTableId, id, cellOptions = {}) {
  const { value, ...others } = cellOptions;

  const clientMetadata = pascalizeKeys(others);
  // TODO(daishi): Generalize functionality to not assume client metadata
  // capability (this issue exists elsewhere also).
  const fluxOptions = {
    Metadata: true,
    ClientMetadata: clientMetadata,
    IgnoreValue: value === undefined,
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

function createCell(credentials, dataTableId, label, cellOptions = {}) {
  const value = cellOptions.value === undefined ? null : cellOptions.value;
  return updateCell(credentials, dataTableId, '', { label, value, ...cellOptions });
}

function fetchCellMetadata(credentials, dataTableId, cellId) {
  // We can't use Cell.listCells since Cell.serializeList may be overridden and therefore
  // there's no guarantee about the return object's shape.
  // Also, we use the endpoint for listing cells rather than fetching a single cell
  // for performance reasons. The latter request contains the cell's value,
  // which may be quite large.
  // TODO: Once the back end supports an option that lets us fetch a cell's metadata without
  // its value, we can switch over.
  return authenticatedRequest(credentials, cellsPath(dataTableId), { fluxOptions: true })
    .then(cells => {
      // Uses Array.filter instead of Array.find due to IE's lack of support for Array.find
      const matches = cells.filter(cell => cell.CellId === cellId);
      return matches ? matches[0] : {};
    })
    .then(cell => (cell.ClientMetadata || {}))
    .then(camelizeKeys);
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

  function update(cellOptions) {
    // Even though update is a POST request, the back end will overwrite certain keys
    // if they're not present (such as description) and do nothing if the 'label'
    // isn't present.
    // We therefore have to combine the new changes with the original state to ensure
    // that the expected behaviour occurs.
    return fetchCellMetadata(credentials, dataTableId, id)
      .then(data => updateCell(credentials, dataTableId, id, { ...data, ...cellOptions }));
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
