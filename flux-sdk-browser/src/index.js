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

const WrappedFluxSdk = fluxSdkWrapper({
  WebSocket,
  fetch: window.fetch,
  base64Decode: atob,
  base64Encode: btoa,
  parseUrl,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
});

function FluxSdk(clientId, options = {}) {
  return new WrappedFluxSdk(clientId, { ...options, implicit: true });
}

module.exports = FluxSdk;
