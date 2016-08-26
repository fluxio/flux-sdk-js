import serialize from '../../../src/serializers/history-serializer';
import historyFactory from './../../factories/history-response-factory';

describe('serializers.historySerializer', function() {
  describe('#serialize', function() {
    it('should serialize the events', function() {
      const historyResponse = historyFactory({
        fileName: 'foo.xls',
      });
      const serializedHistory = serialize(historyResponse);
      const entities = serializedHistory.entities;

      expect(entities.length).toEqual(1);

      const event = entities[0];

      expect(event.cellId).toEqual('CELL_ID');
      expect(event.eventType).toEqual('CELL_MODIFIED');
      expect(event.time).toEqual(jasmine.any(Number));
      expect(event.size).toEqual(jasmine.any(Number));
      expect(event.valueHref).toEqual('/SOME_VALUE_REF_PATH/');
      expect(event.authorId).toEqual('USER_ID');
      expect(event.authorName).toEqual('USERNAME');
      expect(event.clientId).toEqual('CLIENT_ID');
      expect(event.clientName).toEqual('CLIENT NAME');
      expect(event.hostFileName).toEqual('foo.xls');
    });

    describe('with no historyCursor', function() {
      beforeEach(function() {
        const historyResponse = historyFactory();
        this.serializedHistory = serialize(historyResponse);
      });

      it('should set cursor and limit accordingly', function() {
        expect(this.serializedHistory.cursor).toEqual(null);
        expect(this.serializedHistory.limit).toEqual(0);
      });
    });

    describe('with a historyCursor', function() {
      beforeEach(function() {
        const historyResponse = historyFactory({ limit: 5, cursor: 'FOO_CURSOR' });
        this.serializedHistory = serialize(historyResponse);
      });

      it('should set the cursor and cursor limit', function() {
        expect(this.serializedHistory.limit).toEqual(5);
        expect(this.serializedHistory.cursor).toEqual('FOO_CURSOR');
      });
    });

    describe('with totalCount', function() {
      beforeEach(function() {
        const historyResponse = historyFactory({ totalCount: 100 });
        this.serializedHistory = serialize(historyResponse);
      });

      it('should set the totalCount field', function() {
        expect(this.serializedHistory.totalCount).toEqual(100);
      });
    });
  });
});
