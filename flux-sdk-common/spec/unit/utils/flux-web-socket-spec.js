import FluxWebSocket from '../../../src/utils/flux-web-socket';
import * as reconnectingWebSocketModule from '../../../src/utils/reconnecting-web-socket';

describe('utils.FluxWebSocket', function() {
  beforeEach(function() {
    const reconnectingWebSocketHandlers = {};
    this.reconnectingWebSocketSpy = jasmine.createSpyObj('reconnectingWebSocket', [
      'connect',
      'close',
      'send',
      'on',
      'emit',
    ]);
    this.reconnectingWebSocketSpy.emit.and.callFake((type, message) => {
      (reconnectingWebSocketHandlers[type] || []).forEach(handler => handler(message));
    });
    this.reconnectingWebSocketSpy.on.and.callFake((type, handler) => {
      reconnectingWebSocketHandlers[type] = reconnectingWebSocketHandlers[type] || [];
      reconnectingWebSocketHandlers[type].push(handler);
    });

    spyOn(reconnectingWebSocketModule, 'default').and.returnValue(this.reconnectingWebSocketSpy);

    this.fetchWebSocketPathSpy = jasmine.createSpy('fetchWebSocketPath');
    this.onOpenSpy = jasmine.createSpy('onOpen');
    this.onErrorSpy = jasmine.createSpy('onError');

    this.fluxWebSocket = new FluxWebSocket(this.fetchWebSocketPathSpy, {
      onOpen: this.onOpenSpy,
      onError: this.onErrorSpy,
      pingTimeout: 1000,
      foo: 'bar',
    });

    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('should create a new reconnecting web socket', function() {
    expect(reconnectingWebSocketModule.default)
      .toHaveBeenCalledWith(this.fetchWebSocketPathSpy, {
        foo: 'bar',
      });
  });

  describe('#connect', function() {
    it('should connect the reconnecting web socket', function() {
      this.fluxWebSocket.connect();

      expect(this.reconnectingWebSocketSpy.connect).toHaveBeenCalled();
    });
  });

  describe('#close', function() {
    it('should close the reconnecting web socket', function() {
      this.fluxWebSocket.close();

      expect(this.reconnectingWebSocketSpy.close).toHaveBeenCalled();
    });
  });

  describe('#send', function() {
    it('should send a serialized version of the message', function() {
      this.fluxWebSocket.send('SUBCHANNEL', 'MESSAGE DATA');

      expect(this.reconnectingWebSocketSpy.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'SUBCHANNEL',
        body: 'MESSAGE DATA',
      }));
    });
  });

  describe('#addHandler', function() {
    beforeEach(function() {
      this.handlerSpy1 = jasmine.createSpy('handler1');
      this.handlerSpy2 = jasmine.createSpy('handler2');
      this.fluxWebSocket.addHandler('SUBCHANNEL', this.handlerSpy1);
      this.fluxWebSocket.addHandler('SUBCHANNEL', this.handlerSpy2);
    });

    describe('when the web socket receives a message for the specified subchannel', function() {
      beforeEach(function() {
        this.reconnectingWebSocketSpy.emit('message', {
          data: JSON.stringify({
            type: 'SUBCHANNEL',
            body: 'MESSAGE DATA',
          }),
        });
      });

      it('should call all handlers for that subchannel with the parsed message', function() {
        expect(this.handlerSpy1).toHaveBeenCalledWith('MESSAGE DATA');
        expect(this.handlerSpy2).toHaveBeenCalledWith('MESSAGE DATA');
      });
    });

    describe('when the web socket receives a message for a different subchannel', function() {
      beforeEach(function() {
        this.reconnectingWebSocketSpy.emit('message', {
          data: JSON.stringify({
            type: 'ANOTHER_SUBCHANNEL',
            body: 'MESSAGE DATA',
          }),
        });
      });

      it('should not call the handlers', function() {
        expect(this.handlerSpy1).not.toHaveBeenCalled();
        expect(this.handlerSpy2).not.toHaveBeenCalled();
      });
    });

    describe('when the handler has been added multiple times', function() {
      beforeEach(function() {
        this.fluxWebSocket.addHandler('SUBCHANNEL', this.handlerSpy1);
      });

      it('should only get called once', function() {
        this.reconnectingWebSocketSpy.emit('message', {
          data: JSON.stringify({
            type: 'SUBCHANNEL',
            body: 'MESSAGE DATA',
          }),
        });

        expect(this.handlerSpy1).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#removeHandler', function() {
    beforeEach(function() {
      this.handlerSpy = jasmine.createSpy('handler');
      this.fluxWebSocket.addHandler('SUBCHANNEL', this.handlerSpy);
      this.fluxWebSocket.removeHandler('SUBCHANNEL', this.handlerSpy);
    });

    describe('when the web socket receives a message for the original subchannel', function() {
      beforeEach(function() {
        this.reconnectingWebSocketSpy.emit('message', {
          data: JSON.stringify({
            type: 'SUBCHANNEL',
            body: 'ANYTHING',
          }),
        });
      });

      it('should not call the handler', function() {
        expect(this.handlerSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the reconnecting web socket receives a PING', function() {
    beforeEach(function() {
      jasmine.clock().tick(500);

      this.reconnectingWebSocketSpy.emit('message', {
        data: JSON.stringify({ type: 'PING' }),
      });
    });

    it('should send a PONG response', function() {
      expect(this.reconnectingWebSocketSpy.send)
        .toHaveBeenCalledWith(JSON.stringify({
          type: 'PONG',
        }));
    });

    it('should reset the ping timeout', function() {
      jasmine.clock().tick(999);

      expect(this.reconnectingWebSocketSpy.close).not.toHaveBeenCalled();
    });
  });

  describe('when there is no PING for the duration of the pingTimeout', function() {
    beforeEach(function() {
      jasmine.clock().tick(500);
      this.reconnectingWebSocketSpy.connect.calls.reset();
    });

    it('should reopen the reconnecting web socket', function() {
      this.reconnectingWebSocketSpy.emit('message', {
        data: JSON.stringify({ type: 'PING' }),
      });

      expect(this.reconnectingWebSocketSpy.close).not.toHaveBeenCalled();
      expect(this.reconnectingWebSocketSpy.connect).not.toHaveBeenCalled();

      jasmine.clock().tick(2000);

      expect(this.reconnectingWebSocketSpy.close).toHaveBeenCalled();
      expect(this.reconnectingWebSocketSpy.connect).toHaveBeenCalled();
    });
  });

  describe('when the reconnecting web socket opens', function() {
    beforeEach(function() {
      jasmine.clock().tick(999);
      this.reconnectingWebSocketSpy.emit('open');
    });

    it('should call the onOpen handler', function() {
      expect(this.onOpenSpy).toHaveBeenCalled();
    });

    it('should reset the ping timeout', function() {
      // 999 + 5 > pingTimeout
      jasmine.clock().tick(5);
      expect(this.reconnectingWebSocketSpy.close).not.toHaveBeenCalled();
    });
  });

  describe('when the reconnecting web socket has an error', function() {
    beforeEach(function() {
      this.reconnectingWebSocketSpy.emit('error');
    });

    it('should call the onError callback', function() {
      expect(this.onErrorSpy).toHaveBeenCalled();
    });
  });
});
