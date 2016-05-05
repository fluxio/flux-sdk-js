import { setFetch } from './fetch';
import { setWebSocket } from './web-socket';
import { setBase64Encoders } from './base64';
import { setQueryEncoders } from './querystring';
import { setUrlParse } from './url';

const EXPECTED_PORTS = [
  'fetch',
  'WebSocket',
  'base64Encode',
  'base64Decode',
  'parseQuery',
  'stringifyQuery',
  'parseUrl',
];

function setPorts(ports = {}) {
  EXPECTED_PORTS.forEach(expectedPort => {
    if (!ports[expectedPort]) {
      throw new Error(`Must provide a port for \`${expectedPort}\``);
    }
  });
  setFetch(ports.fetch);
  setWebSocket(ports.WebSocket);
  setBase64Encoders(ports.base64Encode, ports.base64Decode);
  setQueryEncoders(ports.parseQuery, ports.stringifyQuery);
  setUrlParse(ports.parseUrl);
}

export { setPorts };
