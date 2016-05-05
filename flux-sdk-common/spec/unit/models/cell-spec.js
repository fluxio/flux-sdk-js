import Cell from '../../../src/models/cell';
import * as dataTableModule from '../../../src/models/data-table';
import * as typeCheckers from '../../../src/utils/schema-validators';
import * as requestUtils from '../../../src/utils/request';
import * as cellSerializer from '../../../src/serializers/cell-serializer';
import credentialsFactory from '../../factories/credentials-factory';

describe('models.Cell', function() {
  beforeEach(function() {
    this.dataTableSpy = jasmine.createSpyObj('dataTable', ['fetchHistory']);

    spyOn(dataTableModule, 'default').and.returnValue(this.dataTableSpy);
    spyOn(typeCheckers, 'checkCell').and.callThrough();
    spyOn(Cell, 'serialize').and.returnValue('SERIALIZED');
    spyOn(Cell, 'serializeDelete').and.returnValue('SERIALIZED');
    spyOn(requestUtils, 'authenticatedRequest').and.returnValue(Promise.resolve('RESPONSE'));

    this.credentials = credentialsFactory({ clientId: 'CLIENT_ID' });
    this.cell = new Cell(this.credentials, 'DATA_TABLE_ID', 'CELL_ID');
  });

  describe('#constructor', function() {
    it('should validate the required parameters', function() {
      expect(typeCheckers.checkCell).toHaveBeenCalledWith({
        credentials: this.credentials,
        dataTableId: 'DATA_TABLE_ID',
        id: 'CELL_ID',
      });
    });
  });

  describe('#fetch', function() {
    beforeEach(function(done) {
      this.cell.fetch().then(response => { this.response = response; })
        .then(done, done.fail);
    });

    it('should get the client metadata and value of the cell', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials,
        'p/DATA_TABLE_ID/api/datatable/v1/cells/CELL_ID/', {
          fluxOptions: {
            Metadata: true,
            ClientMetadata: true,
          },
        }
      );
    });

    it('should return the serialized response', function() {
      expect(Cell.serialize).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED');
    });
  });

  describe('#update', function() {
    it('should return the response', function(done) {
      this.cell.update({ value: 10, label: 'NEW LABEL' })
        .then(response => {
          expect(Cell.serialize).toHaveBeenCalledWith('RESPONSE');
          expect(response).toEqual('SERIALIZED');
        })
        .then(done, done.fail);
    });

    describe('when there is both a value and metadata', function() {
      beforeEach(function(done) {
        this.cell.update({ value: 10, label: 'NEW LABEL' })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should update the value and client metadata of the cell', function() {
        expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
          this.credentials,
          'p/DATA_TABLE_ID/api/datatable/v1/cells/CELL_ID/', {
            method: 'post',
            fluxOptions: {
              Metadata: true,
              ClientMetadata: { Label: 'NEW LABEL' },
            },
            body: 10,
          }
        );
      });
    });

    describe('when there is only a value', function() {
      beforeEach(function(done) {
        this.cell.update({ value: 10 })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should update only the value of the cell', function() {
        expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
          this.credentials,
          'p/DATA_TABLE_ID/api/datatable/v1/cells/CELL_ID/', {
            method: 'post',
            fluxOptions: {
              Metadata: true,
              ClientMetadata: {},
            },
            body: 10,
          }
        );
      });
    });

    describe('when there is only metadata', function() {
      beforeEach(function(done) {
        this.cell.update({ label: 'NEW LABEL' })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should update only the metadata of the cell', function() {
        expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
          this.credentials,
          'p/DATA_TABLE_ID/api/datatable/v1/cells/CELL_ID/', jasmine.objectContaining({
            method: 'post',
            fluxOptions: {
              Metadata: true,
              ClientMetadata: { Label: 'NEW LABEL' },
            },
          })
        );
      });
    });
  });

  describe('#delete', function() {
    beforeEach(function(done) {
      this.cell.delete().then(response => { this.response = response; })
        .then(done, done.fail);
    });

    it('should delete the cell', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials, 'p/DATA_TABLE_ID/api/datatable/v1/cells/CELL_ID/', {
          fluxOptions: {
            Metadata: true,
            ClientMetadata: true,
          },
          method: 'delete',
        }
      );
    });

    it('should return the serialized response', function() {
      expect(Cell.serializeDelete).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED');
    });
  });

  describe('#fetchHistory', function() {
    beforeEach(function() {
      this.dataTableSpy.fetchHistory.and.returnValue('HISTORY_RESPONSE');
    });

    it('should fetch the history of the cell', function() {
      const historyResponse = this.cell.fetchHistory({ limit: 5 });

      expect(dataTableModule.default).toHaveBeenCalledWith(this.credentials, 'DATA_TABLE_ID');
      expect(this.dataTableSpy.fetchHistory).toHaveBeenCalledWith({
        cellIds: ['CELL_ID'],
        limit: 5,
      });
      expect(historyResponse).toEqual('HISTORY_RESPONSE');
    });
  });
});

describe('models.Cell.static', function() {
  beforeEach(function() {
    spyOn(requestUtils, 'authenticatedRequest')
      .and.returnValue(Promise.resolve('RESPONSE'));

    this.credentials = credentialsFactory({ clientId: 'CLIENT_ID' });
  });

  it('should use the correct default serializers', function() {
    expect(Cell.serialize).toEqual(cellSerializer.serialize);
    expect(Cell.serializeDelete).toEqual(cellSerializer.serializeDelete);
    expect(Cell.serializeList).toEqual(cellSerializer.serializeList);
  });

  describe('#listCells', function() {
    beforeEach(function(done) {
      spyOn(Cell, 'serializeList').and.returnValue('SERIALIZED_CELLS');
      Cell.listCells(this.credentials, 'DATA_TABLE_ID')
        .then(response => { this.response = response; })
        .then(done, done.fail);
    });

    it('should fetch the cells with fluxOptions', function() {
      expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
        this.credentials,
        'p/DATA_TABLE_ID/api/datatable/v1/cells/',
        { fluxOptions: true }
      );
    });

    it('should return the serialized cells', function() {
      expect(Cell.serializeList).toHaveBeenCalledWith('RESPONSE');
      expect(this.response).toEqual('SERIALIZED_CELLS');
    });
  });

  describe('#createCell', function() {
    beforeEach(function() {
      spyOn(Cell, 'serialize').and.returnValue('SERIALIZED_CELL');
    });

    describe('when there is a value', function() {
      beforeEach(function(done) {
        Cell.createCell(this.credentials, 'DATA_TABLE_ID', 'NEW KEY', {
          value: 10,
          description: 'FOO',
        })
        .then(response => { this.response = response; })
        .then(done, done.fail);
      });

      it('should set the value and client metadata of the new cell', function() {
        expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
          this.credentials,
          'p/DATA_TABLE_ID/api/datatable/v1/cells/', {
            method: 'post',
            fluxOptions: {
              Metadata: true,
              ClientMetadata: { Label: 'NEW KEY', Description: 'FOO' },
            },
            body: 10,
          }
        );
      });

      it('should return the serialized response', function() {
        expect(Cell.serialize).toHaveBeenCalledWith('RESPONSE');
        expect(this.response).toEqual('SERIALIZED_CELL');
      });
    });

    describe('when there is no value', function() {
      beforeEach(function(done) {
        Cell.createCell(this.credentials, 'DATA_TABLE_ID', 'NEW KEY')
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should set the client metadata of the new cell', function() {
        expect(requestUtils.authenticatedRequest).toHaveBeenCalledWith(
          this.credentials,
          'p/DATA_TABLE_ID/api/datatable/v1/cells/', jasmine.objectContaining({
            method: 'post',
            fluxOptions: {
              Metadata: true,
              ClientMetadata: { Label: 'NEW KEY' },
            },
          })
        );
      });

      it('should return the serialized response', function() {
        expect(Cell.serialize).toHaveBeenCalledWith('RESPONSE');
        expect(this.response).toEqual('SERIALIZED_CELL');
      });
    });
  });
});
