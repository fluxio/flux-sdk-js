import {
  DATA_TABLE_ERROR,
  DATA_TABLE_CELL_DELETED,
} from '../constants/data-table-notification-types';
// import {
//   ISSUE_CREATED,
//   ISSUE_UPDATED,
// } from '../constants/issue-notification-types';
import {
  serialize as serializeCell,
  serializeDelete,
} from './cell-serializer';

function serializeDataTableMessage({ Type, Data }) {
  let serializedMessage = null;
  if (Type === DATA_TABLE_ERROR) {
    // TODO: Change this depending on what the payload actually looks like
    serializedMessage = {
      type: Type,
      body: Data,
    };
  } else {
    const { CellInfo, Event } = Data;
    serializedMessage = {
      type: Event.Type,
      body: Event.Type === DATA_TABLE_CELL_DELETED ? serializeDelete(CellInfo) :
        serializeCell(CellInfo),
    };
  }
  return serializedMessage;
}

export {
  serializeDataTableMessage,
};
