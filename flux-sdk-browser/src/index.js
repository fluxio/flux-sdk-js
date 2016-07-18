import 'whatwg-fetch';
import qs from 'query-string';

import fluxSdkWrapper from 'flux-sdk-common';

function parseUrl(url) {
  // https://gist.github.com/jlong/2428561
  const anchor = document.createElement('a');
  anchor.href = url;
  return {
    href: anchor.href,
    protocol: anchor.protocol,
    hostname: anchor.hostname,
    port: anchor.port,
    pathname: anchor.pathname,
    search: anchor.search,
    hash: anchor.hash,
    host: anchor.host,
    query: qs.parse(anchor.search),
  };
}

// b64DecodeUnicode and b64EncodeUnicode are from
// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_1_–_escaping_the_string_before_encoding_it
/* eslint-disable */
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}
/* eslint-enable */

const WrappedFluxSdk = fluxSdkWrapper({
  WebSocket,
  fetch: window.fetch,
  base64Decode: b64DecodeUnicode,
  base64Encode: b64EncodeUnicode,
  parseUrl,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
});

function FluxSdk(clientId, options = {}) {
  return new WrappedFluxSdk(clientId, { ...options, implicit: true });
}

module.exports = FluxSdk;
