import qs from 'query-string';

import fluxSdkWrapper from 'flux-sdk-common';
import { handleCredentials } from 'flux-sdk-common/lib/utils/open-id-connect';

const emptyBody = JSON.stringify(null);

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

function scriptFetch(path, options = {}) {
  const { headers, method, body } = options;
  const requestOptions = {
    muteHttpExceptions: false,
    headers: headers || {},
    method: method || 'get',
    payload: body || emptyBody,
    contentType: headers['Content-Type'] || headers['content-type'] || 'application/json',
  };

  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .makeURLFetchAppCall(path, requestOptions);
  })
    .then(response => {
      const responseHeaders = response.headers;
      const responseBody = response.body;
      return {
        headers: {
          has: header => !!responseHeaders[header],
          get: header => responseHeaders[header] || '',
        },
        text: () => Promise.resolve(responseBody),
        json: () => Promise.resolve(JSON.parse(responseBody)),
      };
    });
}

const WrappedFluxSdk = fluxSdkWrapper({
  parseUrl,
  WebSocket,
  base64Encode: btoa,
  base64Decode: atob,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
  fetch: scriptFetch,
});

function FluxSdk(clientId, options = {}) {
  return new WrappedFluxSdk(clientId, { ...options, implicit: true });
}

FluxSdk.handleCredentials = handleCredentials;

module.exports = FluxSdk;
