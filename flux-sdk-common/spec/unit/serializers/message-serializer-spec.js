import {
  serializeDataTableMessage,
} from '../../../src/serializers/message-serializer';
import * as cellSerializer from '../../../src/serializers/cell-serializer';

describe('serializers.messageSerializer', function() {
  describe('#serializeDataTableMessage', function() {
    beforeEach(function() {
      spyOn(cellSerializer, 'serialize').and.returnValue('SERIALIZED_CELL');
      spyOn(cellSerializer, 'serializeDelete').and.returnValue('SERIALIZED_CELL_DELETION');
    });

    describe('when the message is an error', function() {
      it('should return the error message as the body', function() {
        const message = {
          Type: 'ERROR',
          Data: 'SOME ERROR MESSAGE',
        };
        const serializedMessage = serializeDataTableMessage(message);

        expect(serializedMessage).toEqual({
          type: 'ERROR',
          body: 'SOME ERROR MESSAGE',
        });
      });
    });

    describe('when the message is about a cell deletion', function() {
      it('should serialize the message data as a deleted cell', function() {
        const message = {
          Type: 'NOTIFICATION',
          Data: {
            Event: { Type: 'CELL_DELETED' },
            CellInfo: 'SOME DATA',
          },
        };
        const serializedMessage = serializeDataTableMessage(message);

        expect(cellSerializer.serializeDelete).toHaveBeenCalledWith('SOME DATA');
        expect(serializedMessage).toEqual({
          type: 'CELL_DELETED',
          body: 'SERIALIZED_CELL_DELETION',
        });
      });
    });

    describe('when the message is about another cell event', function() {
      it('should serialize the message data as a cell', function() {
        const message = {
          Type: 'NOTIFICATION',
          Data: {
            Event: { Type: 'CELL_CREATED' },
            CellInfo: 'SOME DATA',
          },
        };
        const serializedMessage = serializeDataTableMessage(message);

        expect(cellSerializer.serialize).toHaveBeenCalledWith('SOME DATA');
        expect(serializedMessage).toEqual({
          type: 'CELL_CREATED',
          body: 'SERIALIZED_CELL',
        });
      });
    });
  });
});
