import ReconnectingWebSocket from './reconnecting-web-socket';

function handleError() {
  throw new Error('Error connecting to web socket');
}

function FluxWebSocket(fetchWebSocketPath, options) {
  const { onOpen, onError, pingTimeout, ...others } = {
    onError: handleError,
    pingTimeout: 30000,
    ...options,
  };

  const webSocket = new ReconnectingWebSocket(fetchWebSocketPath, others);
  const handlers = {};

  let pingTimeoutId = null;

  function handlePingTimeout() {
    close();
    connect();
  }

  function resetPing() {
    clearTimeout(pingTimeoutId);
    pingTimeoutId = setTimeout(handlePingTimeout, pingTimeout);
  }

  function handleOpen() {
    resetPing();
    if (onOpen) { onOpen(); }
  }

  function pingPong() {
    resetPing();
    send('PONG');
  }

  function handleMessage({ data }) {
    const { type, body } = JSON.parse(data);
    if (type === 'PING') {
      pingPong();
    } else {
      (handlers[type] || []).forEach(handler => handler(body));
    }
  }

  function connect() {
    webSocket.connect();
  }

  function close() {
    webSocket.close();
  }

  function send(subchannel, message) {
    webSocket.send(JSON.stringify({
      type: subchannel,
      body: message,
    }));
  }

  function addHandler(subchannel, handler) {
    handlers[subchannel] = handlers[subchannel] || [];
    handlers[subchannel].push(handler);
  }

  function removeHandler(subchannel, handler) {
    const subchannelHandlers = handlers[subchannel] || [];
    const index = subchannelHandlers.indexOf(handler);
    if (index !== -1) { subchannelHandlers.splice(index, 1); }
  }

  webSocket.on('open', handleOpen);
  webSocket.on('message', handleMessage);
  webSocket.on('error', onError);

  this.connect = connect;
  this.close = close;
  this.send = send;
  this.addHandler = addHandler;
  this.removeHandler = removeHandler;
}

export default FluxWebSocket;
