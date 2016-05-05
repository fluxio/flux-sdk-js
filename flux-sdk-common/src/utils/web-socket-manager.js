import FluxWebSocket from './flux-web-socket';

const webSockets = {};

function createWebSocket(id, fetchWebSocketPath, options) {
  webSockets[id] = webSockets[id] || new FluxWebSocket(fetchWebSocketPath, options);
  webSockets[id].connect();
  return webSockets[id];
}

export default createWebSocket;
