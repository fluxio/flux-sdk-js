let webSocketPolyfill = null;

function setWebSocket(polyfill) {
  webSocketPolyfill = polyfill;
}

function webSocketWrapper(...args) {
  return new (webSocketPolyfill || WebSocket)(...args);
}

export {
  setWebSocket,
  webSocketWrapper as WebSocket,
};
