import {
  serialize,
  serializeDelete,
  serializeList,
} from '../../../src/serializers/cell-serializer';
import cellFactory from './../../factories/cell-response-factory';
import cellDeleteFactory from './../../factories/cell-delete-response-factory';

describe('serializer.cellSerializer', function() {
  describe('#serialize', function() {
    it('should serialize a cell', function() {
      const cellResponse = cellFactory(100);
      const serializedCell = serialize(cellResponse);

      expect(serializedCell.id).toEqual(100);
      expect(serializedCell.label).toEqual('LABEL 100');
      expect(serializedCell.description).toEqual('DESCRIPTION 100');
      expect(serializedCell.size).toEqual(jasmine.any(Number));
      expect(serializedCell.timeUpdated).toEqual(jasmine.any(Date));
      expect(serializedCell.locked).toEqual(false);
      expect(serializedCell.authorId).toEqual('USER_ID_100');
      expect(serializedCell.authorName).toEqual('USERNAME_100');
      expect(serializedCell.clientId).toEqual('CLIENT_ID_100');
      expect(serializedCell.clientName).toEqual('CLIENT NAME 100');
      expect(serializedCell.fileName).toEqual('some-file.csv');
    });

    describe('when the cell has a value', function() {
      it('should set the value', function() {
        const cellResponse = cellFactory(5, { value: 'SOME_VALUE' });
        const serializedCell = serialize(cellResponse);

        expect(serializedCell.value).toEqual('SOME_VALUE');
      });
    });

    describe('when the cell has a defined, falsey value', function() {
      it('should set the value', function() {
        let cellResponse = cellFactory(5, { value: 0 });
        let serializedCell = serialize(cellResponse);

        expect(serializedCell.value).toEqual(0);

        cellResponse = cellFactory(5, { value: false });
        serializedCell = serialize(cellResponse);

        expect(serializedCell.value).toEqual(false);

        cellResponse = cellFactory(5, { value: null });
        serializedCell = serialize(cellResponse);

        expect(serializedCell.value).toEqual(null);
      });
    });

    describe('when the has an undefined value', function() {
      it('should not set the value', function() {
        const cellResponse = cellFactory(5);
        const serializedCell = serialize(cellResponse);

        expect(serializedCell.value).not.toBeDefined();
      });
    });
  });

  describe('#serializeDelete', function() {
    it('should return the ID of the deleted cell', function() {
      const cellResponse = cellDeleteFactory(555);
      const serializedResponse = serializeDelete(cellResponse);

      expect(serializedResponse.id).toEqual(555);
    });
  });

  describe('#serializeList', function() {
    it('should serialize a list of cells', function() {
      const cellListResponse = [1, 2].map(id => cellFactory(id));
      const serializedCells = serializeList(cellListResponse);

      const entities = serializedCells.entities;

      expect(entities.length).toEqual(2);
      expect(entities.map(entity => entity.id)).toContain(1, 2);
      expect(entities[0]).toEqual(serialize(cellListResponse[0]));
      expect(entities[1]).toEqual(serialize(cellListResponse[1]));
    });
  });
});
