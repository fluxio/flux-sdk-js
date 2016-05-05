import qs from 'querystring';
import url from 'url';
import fetch from 'node-fetch';
import WebSocket from 'ws';

import fluxSdkWrapper from 'flux-sdk-common';

function base64Decode(string) { return new Buffer(string, 'base64').toString(); }

function base64Encode(string) { return new Buffer(string).toString('base64'); }

function parseUrl(string) { return url.parse(string, true); }

const FluxSdk = fluxSdkWrapper({
  WebSocket,
  fetch,
  base64Decode,
  base64Encode,
  parseUrl,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
});

module.exports = FluxSdk;
