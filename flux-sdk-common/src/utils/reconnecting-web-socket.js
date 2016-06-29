import EventEmitter from 'events';
import { WebSocket } from '../ports/web-socket';

function ReconnectingWebSocket(fetchWebSocketPath, options = {}) {
  EventEmitter.call(this);

  const { delayMultiplier, errorTimeout, credentials } = {
    delayMultiplier: 1.2,
    errorTimeout: 120000,
    credentials: {},
    ...options,
  };

  const self = this;
  const buffer = [];
  const accessToken = credentials.accessToken || '';

  let reconnectDelay = options.reconnectDelay || 5000;
  let webSocket = null;
  let killed = false;
  let errorTimeoutId = null;
  let attemptReconnectId = null;
  let isReconnecting = false;

  function attemptReconnect() {
    isReconnecting = false;
    connect();
  }

  function onError(error) {
    self.emit('error', error);
    webSocket = null;
    killed = true;
    clearTimeout(attemptReconnectId);
  }

  function reconnect() {
    if (!killed && !isReconnecting) {
      webSocket = null;
      isReconnecting = true;
      attemptReconnectId = setTimeout(attemptReconnect, reconnectDelay);
      reconnectDelay *= delayMultiplier;
    }
  }

  function onOpen() {
    self.emit('open');
    clearTimeout(errorTimeoutId);
    buffer.forEach(send);
    buffer.splice(0);
  }

  function onMessage(message) {
    self.emit('message', message);
  }

  function send(message) {
    if (webSocket && webSocket.readyState === webSocket.OPEN) {
      webSocket.send(message);
    } else {
      buffer.push(message);
    }
  }

  function initializeWebSocket(path) {
    webSocket = new WebSocket(path, [], {
      headers: { cookie: `auth=${accessToken}` },
    });

    webSocket.onopen = onOpen;
    webSocket.onmessage = onMessage;
    webSocket.onclose = reconnect;
    webSocket.onerror = reconnect;
  }

  function connect() {
    killed = false;
    if (webSocket && webSocket.readyState === webSocket.CLOSING) {
      reconnect();
    } else if (!webSocket || (webSocket && webSocket.readyState === webSocket.CLOSED)) {
      errorTimeoutId = setTimeout(onError, errorTimeout);
      fetchWebSocketPath()
        .then(initializeWebSocket)
        .catch(reconnect);
    }
  }

  function close() {
    killed = true;
    if (webSocket) { webSocket.close(); }
  }

  this.connect = connect;
  this.close = close;
  this.send = send;
}

ReconnectingWebSocket.prototype = Object.create(EventEmitter.prototype);
ReconnectingWebSocket.prototype.constructor = ReconnectingWebSocket;

export default ReconnectingWebSocket;
