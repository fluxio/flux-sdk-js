import ReconnectingWebSocket from '../../../src/utils/reconnecting-web-socket';
import * as webSocketPort from '../../../src/ports/web-socket';

describe('utils.ReconnectingWebSocket', function() {
  beforeEach(function() {
    // Sadly, this spy needs to be quite substantial
    // to mimic the relevant WebSocket behaviour :(
    this.webSocketSpy = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      open: jasmine.createSpy('open').and.callFake(() => {
        this.webSocketSpy.readyState = this.webSocketSpy.OPEN;
        this.webSocketSpy.onopen();
      }),
      close: jasmine.createSpy('close').and.callFake(() => {
        this.webSocketSpy.readyState = this.webSocketSpy.CLOSED;
        this.webSocketSpy.onclose();
      }),
      error: jasmine.createSpy('error').and.callFake(() => {
        this.webSocketSpy.readyState = this.webSocketSpy.CLOSED;
        this.webSocketSpy.onclose();
        this.webSocketSpy.onerror();
      }),
      message: jasmine.createSpy('message').and.callFake(message => {
        this.webSocketSpy.onmessage(message);
      }),
      send: jasmine.createSpy('send'),
    };

    spyOn(webSocketPort, 'WebSocket').and.returnValue(this.webSocketSpy);

    this.fetchWebSocketPathDeferred = {};
    this.fetchWebSocketPromise = new Promise((resolve, reject) => {
      this.fetchWebSocketPathDeferred.resolve = resolve;
      this.fetchWebSocketPathDeferred.reject = reject;
    });
    this.fetchWebSocketPathSpy = jasmine.createSpy('fetchWebSocketPath')
      .and.returnValue(this.fetchWebSocketPromise);

    this.reconnectingWebSocket = new ReconnectingWebSocket(this.fetchWebSocketPathSpy, {
      delayMultiplier: 1,
      errorTimeout: 10000,
      reconnectDelay: 1000,
      credentials: { accessToken: 'ACCESS_TOKEN' },
    });

    this.openWebSocket = (callback, path) => {
      this.reconnectingWebSocket.connect();
      this.fetchWebSocketPathDeferred.resolve(path);
      this.fetchWebSocketPromise
        .then(this.webSocketSpy.open)
        .then(callback);
    };

    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('#connect', function() {
    describe('when there is no web socket', function() {
      beforeEach(function() {
        this.reconnectingWebSocket.connect();
      });

      describe('when #fetchWebSocketPath succeeds', function() {
        beforeEach(function(done) {
          this.fetchWebSocketPathDeferred.resolve('WEB_SOCKET_PATH');
          this.fetchWebSocketPromise.then(done);
        });

        it('should set up the Web Socket', function() {
          expect(webSocketPort.WebSocket).toHaveBeenCalledWith('WEB_SOCKET_PATH', [], {
            headers: { cookie: 'auth=ACCESS_TOKEN' },
          });
        });
      });

      describe('when #fetchWebSocketPath fails', function() {
        beforeEach(function(done) {
          this.fetchWebSocketPathDeferred.reject();
          this.fetchWebSocketPathSpy.calls.reset();
          this.fetchWebSocketPromise
            .catch(() => {
              this.fetchWebSocketPathSpy.calls.reset();
            })
            .then(done);
        });

        it('should wait and try to reconnect', function() {
          // reconnectDelay < 1500 < reconnectDelay * 2
          jasmine.clock().tick(1500);

          expect(this.fetchWebSocketPathSpy).toHaveBeenCalled();
        });
      });
    });
  });

  describe('#close', function() {
    describe('when there is an open web socket', function() {
      beforeEach(function(done) {
        this.openWebSocket(() => {
          this.fetchWebSocketPathSpy.calls.reset();
          webSocketPort.WebSocket.calls.reset();

          done();
        });
      });

      it('should close the web socket', function() {
        this.reconnectingWebSocket.close();

        expect(this.webSocketSpy.close).toHaveBeenCalled();
      });

      it('should not attempt to reconnect', function() {
        this.reconnectingWebSocket.close();

        // 100000 > errorTimeout (by a lot!)
        jasmine.clock().tick(100000);

        expect(this.fetchWebSocketPathSpy).not.toHaveBeenCalled();
        expect(webSocketPort.WebSocket).not.toHaveBeenCalled();
      });
    });

    describe('when there is no web socket', function() {
      it('should not close the (non-existent) web socket', function() {
        this.reconnectingWebSocket.close();

        expect(this.webSocketSpy.close).not.toHaveBeenCalled();
      });
    });
  });

  describe('#send', function() {
    describe('when the web socket exists', function() {
      beforeEach(function(done) {
        this.reconnectingWebSocket.connect();
        this.fetchWebSocketPathDeferred.resolve();
        this.fetchWebSocketPromise.then(done);
      });

      describe('when the web socket is open', function() {
        beforeEach(function() {
          this.webSocketSpy.open();
        });

        it('should send the message immediately', function() {
          this.reconnectingWebSocket.send('SOME MESSAGE');

          expect(this.webSocketSpy.send).toHaveBeenCalledWith('SOME MESSAGE');
        });
      });

      describe('when the web socket is not yet open', function() {
        it('should wait until the web socket opens before sending the message', function() {
          this.reconnectingWebSocket.send('SOME MESSAGE');

          expect(this.webSocketSpy.send).not.toHaveBeenCalled();

          this.webSocketSpy.open();

          expect(this.webSocketSpy.send).toHaveBeenCalledWith('SOME MESSAGE');
        });
      });
    });

    describe('when the web socket does not exist', function() {
      it('should wait to send the message until the web socket exists and is open', function(done) {
        this.reconnectingWebSocket.send('SOME MESSAGE');

        this.openWebSocket(() => {
          expect(this.webSocketSpy.send).toHaveBeenCalledWith('SOME MESSAGE');
          done();
        });
      });
    });
  });

  describe('when the web socket receives a message', function() {
    beforeEach(function(done) {
      this.openWebSocket(done);
    });

    it('should emit "message" with the incoming message', function() {
      const onMessageSpy = jasmine.createSpy('onMessage');
      this.reconnectingWebSocket.on('message', onMessageSpy);

      this.webSocketSpy.message('I am an important message!');

      expect(onMessageSpy).toHaveBeenCalledWith('I am an important message!');
    });
  });

  describe('when the web socket opens', function() {
    beforeEach(function(done) {
      this.onOpenSpy = jasmine.createSpy('onOpen');
      this.reconnectingWebSocket.on('open', this.onOpenSpy);

      this.openWebSocket(done);
    });

    it('should emit "open"', function() {
      expect(this.onOpenSpy).toHaveBeenCalled();
    });
  });

  describe('when the web socket gets closed externally', function() {
    beforeEach(function(done) {
      this.openWebSocket(() => {
        this.fetchWebSocketPathSpy.calls.reset();

        done();
      });
    });

    it('should attempt to reconnect once per timeout period', function() {
      this.webSocketSpy.close();

      // reconnectDelay
      jasmine.clock().tick(1000);

      expect(this.fetchWebSocketPathSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the web socket has an error', function() {
    beforeEach(function(done) {
      this.openWebSocket(() => {
        this.fetchWebSocketPathSpy.calls.reset();

        done();
      });
    });

    it('should attempt to reconnect once per timeout period', function() {
      this.webSocketSpy.error();

      // reconnectDelay
      jasmine.clock().tick(1000);

      expect(this.fetchWebSocketPathSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when connection fails for the duration of the errorTimeout', function() {
    beforeEach(function() {
      this.onErrorSpy = jasmine.createSpy('onError');
      this.reconnectingWebSocket.on('error', this.onErrorSpy);

      this.reconnectingWebSocket.connect();
    });

    it('should emit "error"', function() {
      // errorTimeout
      jasmine.clock().tick(10000);

      expect(this.onErrorSpy).toHaveBeenCalled();
    });

    it('should stop trying to reconnect', function() {
      // errorTimeout
      jasmine.clock().tick(10000);
      this.fetchWebSocketPathSpy.calls.reset();

      expect(this.fetchWebSocketPathSpy).not.toHaveBeenCalled();
    });
  });

  describe('when reconnection fails for the duration of the errorTimeout', function() {
    beforeEach(function(done) {
      this.onErrorSpy = jasmine.createSpy('onError');
      this.reconnectingWebSocket.on('error', this.onErrorSpy);

      this.openWebSocket(() => {
        this.webSocketSpy.close();

        done();
      });
    });

    it('should emit "error"', function() {
      // errorTimeout + reconnectDelay
      jasmine.clock().tick(11000);

      expect(this.onErrorSpy).toHaveBeenCalled();
    });

    it('should stop trying to reconnect', function() {
      // errorTimeout
      jasmine.clock().tick(10000);
      this.fetchWebSocketPathSpy.calls.reset();

      // reconnectDelay
      jasmine.clock().tick(1000);

      expect(this.fetchWebSocketPathSpy).not.toHaveBeenCalled();
    });
  });
});
