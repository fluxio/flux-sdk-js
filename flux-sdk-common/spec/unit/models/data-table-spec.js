import DataTable from '../../../src/models/data-table';
import * as typeCheckers from '../../../src/utils/schema-validators';
import * as requestUtils from '../../../src/utils/request';
import * as cellModule from '../../../src/models/cell';
import * as historySerializer from '../../../src/serializers/history-serializer';
import credentialsFactory from '../../factories/credentials-factory';

describe('models.DataTable', function() {
  beforeEach(function() {
    this.cellSpy = jasmine.createSpyObj('cell', [
      'fetch',
      'update',
      'delete',
    ]);
    spyOn(cellModule, 'default').and.returnValue(this.cellSpy);
    spyOn(typeCheckers, 'checkDataTable').and.callThrough();

    this.credentials = credentialsFactory();
    this.dataTable = new DataTable(this.credentials, 'DATA_TABLE_ID');
  });

  describe('#constructor', function() {
    it('should validate the required parameters', function() {
      expect(typeCheckers.checkDataTable).toHaveBeenCalledWith({
        credentials: this.credentials,
        id: 'DATA_TABLE_ID',
      });
    });
  });

  describe('#fetchCell', function() {
    beforeEach(function() {
      this.cellSpy.fetch.and.returnValue('CELL_RESPONSE');
    });

    it('should fetch the cell', function() {
      const response = this.dataTable.fetchCell('CELL_ID');

      expect(cellModule.default)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
      expect(response).toEqual('CELL_RESPONSE');
    });
  });

  describe('#fetchCapability', function() {
    beforeEach(function() {
      spyOn(requestUtils, 'authenticatedRequest').and.returnValue('CAPABILITY_RESPONSE');
    });

    it('should return the capability of the data table', function() {
      const capability = this.dataTable.fetchCapability();

      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials,
        'p/DATA_TABLE_ID/api/datatable/v1/capability/'
      );
      expect(capability).toEqual('CAPABILITY_RESPONSE');
    });
  });

  describe('#listCells', function() {
    beforeEach(function() {
      spyOn(cellModule.default, 'listCells').and.returnValue('LIST_CELLS_RESPONSE');
    });

    it("should use the data table's credentials to list its cells", function() {
      const cells = this.dataTable.listCells();

      expect(cellModule.default.listCells)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID');
      expect(cells).toEqual('LIST_CELLS_RESPONSE');
    });
  });

  describe('#getCell', function() {
    it('should instantiate the requested cell', function() {
      const cell = this.dataTable.getCell('CELL_ID');

      expect(cellModule.default)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
      expect(cell).toBe(this.cellSpy);
    });
  });

  describe('#createCell', function() {
    beforeEach(function() {
      spyOn(cellModule.default, 'createCell').and.returnValue('CREATE_CELL_RESPONSE');
    });

    it('should create the cell', function() {
      const createdCell = this.dataTable.createCell('LABEL', {
        value: 'VALUE',
        description: 'DESCRIPTION',
      });

      expect(cellModule.default.createCell)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'LABEL', {
          value: 'VALUE',
          description: 'DESCRIPTION',
        });
      expect(createdCell).toEqual('CREATE_CELL_RESPONSE');
    });
  });

  describe('#updateCell', function() {
    beforeEach(function() {
      this.cellSpy.update.and.returnValue('CELL_UPDATE_RESPONSE');
    });

    it('should update the cell', function() {
      const response = this.dataTable.updateCell('CELL_ID', {
        label: 'NEW LABEL',
        description: 'NEW DESCRIPTION',
      });

      expect(cellModule.default)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
      expect(this.cellSpy.update).toHaveBeenCalledWith({
        label: 'NEW LABEL',
        description: 'NEW DESCRIPTION',
      });
      expect(response).toEqual('CELL_UPDATE_RESPONSE');
    });
  });

  describe('#deleteCell', function() {
    beforeEach(function() {
      this.cellSpy.delete.and.returnValue('CELL_DELETE_RESPONSE');
    });

    it('should delete the cell', function() {
      const response = this.dataTable.deleteCell('CELL_ID');

      expect(cellModule.default)
        .toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
      expect(response).toEqual('CELL_DELETE_RESPONSE');
    });
  });

  describe('#fetchHistory', function() {
    beforeEach(function() {
      spyOn(requestUtils, 'authenticatedRequest')
        .and.returnValue(Promise.resolve('HISTORY_RESPONSE'));
      spyOn(DataTable, 'serializeHistory').and.returnValue('SERIALIZED_HISTORY');
    });

    it('should return the serialized response', function(done) {
      this.dataTable.fetchHistory()
        .then(response => {
          expect(requestUtils.authenticatedRequest)
            .toHaveBeenCalledWith(this.credentials, 'p/DATA_TABLE_ID/api/datatable/v1/history/', {
              method: 'post',
              fluxOptions: true,
              body: {
                historyQuery: jasmine.any(Object),
              },
            });
          expect(DataTable.serializeHistory).toHaveBeenCalledWith('HISTORY_RESPONSE');
          expect(response).toEqual('SERIALIZED_HISTORY');
        })
        .then(done)
        .catch(done.fail);
    });

    it('should be able to add additional options', function(done) {
      this.dataTable.fetchHistory({
        cellIds: ['CELL1', 'CELL2'],
        cursor: 'SOME_CURSOR',
        limit: 5,
        eventTypes: ['CELL_MODIFIED'],
        startTime: 1000,
        endTime: 2000,
        values: ['FOO'],
        foo: 'bar',
      })
        .then(() => {
          expect(requestUtils.authenticatedRequest)
            .toHaveBeenCalledWith(this.credentials, 'p/DATA_TABLE_ID/api/datatable/v1/history/', {
              method: 'post',
              fluxOptions: true,
              body: {
                historyQuery: {
                  cells: ['CELL1', 'CELL2'],
                  cursor: 'SOME_CURSOR',
                  limit: 5,
                  types: ['CELL_MODIFIED'],
                  begin: 1000,
                  end: 2000,
                  values: ['FOO'],
                  foo: 'bar',
                },
              },
            });
        })
        .then(done)
        .catch(done.fail);
    });
  });

  describe('#get', function() {
    it('should be deprecated');
  });

  describe('#set', function() {
    it('should be deprecated');
  });

  describe('#create', function() {
    it('should be deprecated');
  });

  describe('#delete', function() {
    it('should be deprecated');
  });
});

describe('models.DataTable.static', function() {
  it('should use the correct default serializers', function() {
    expect(DataTable.serializeHistory).toEqual(historySerializer.default);
  });
});
