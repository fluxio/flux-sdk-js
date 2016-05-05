import createWebSocket from '../../../src/utils/web-socket-manager';
import * as fluxWebSocketModule from '../../../src/utils/flux-web-socket';

describe('utils.webSocketManager', function() {
  beforeEach(function() {
    this.fluxWebSocketSpy = jasmine.createSpyObj('fluxWebSocket', ['connect']);
    spyOn(fluxWebSocketModule, 'default').and.returnValue(this.fluxWebSocketSpy);
  });

  describe('#createWebSocket', function() {
    describe('when no web socket with the matching id exists', function() {
      it('should create and open new FluxWebSocket', function() {
        const fetchWebSocketPathSpy = jasmine.createSpy('fetchWebSocketPath');
        const webSocket = createWebSocket('WEB_SOCKET_ID', fetchWebSocketPathSpy, {
          foo: 'bar',
        });

        expect(fluxWebSocketModule.default)
          .toHaveBeenCalledWith(fetchWebSocketPathSpy, {
            foo: 'bar',
          });
        expect(this.fluxWebSocketSpy.connect).toHaveBeenCalled();
        expect(webSocket).toEqual(this.fluxWebSocketSpy);
      });
    });

    describe('when a web socket the matching id already exists', function() {
      beforeEach(function() {
        const fetchWebSocketPath = jasmine.createSpy('fetchWebSocketPath');
        createWebSocket('SOME_ID', fetchWebSocketPath);
        fluxWebSocketModule.default.calls.reset();

        this.webSocket = createWebSocket('SOME_ID', fetchWebSocketPath);
      });

      it('should connect and return the existing web socket', function() {
        expect(fluxWebSocketModule.default).not.toHaveBeenCalled();
        expect(this.fluxWebSocketSpy.connect).toHaveBeenCalled();
        expect(this.webSocket).toEqual(this.fluxWebSocketSpy);
      });
    });
  });
});
