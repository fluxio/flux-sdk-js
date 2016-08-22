import qs from 'query-string';

import fluxSdkWrapper from 'flux-sdk-common';
import handleCredentials from 'flux-sdk-common/lib/open-id-connect/handle-credentials';

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

  // Given any payload, Apps Script seems to coerce the method from 'get' to 'post'
  // (even if the payload is falsey).
  // Therefore, we need to ensure that the 'payload' key is only set if we really,
  // really mean to send a body.
  const payload = body ? { payload: body } : null;

  const requestOptions = {
    muteHttpExceptions: true,
    headers: headers || {},
    method: method || 'get',
    contentType: headers['Content-Type'] || headers['content-type'] || 'application/json',
    ...payload,
  };

  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .makeURLFetchAppCall(path, requestOptions);
  })
    .then(response => {
      // In the actual fetch API, headers are case-insensitive (i.e., for methods like
      // headers.has and headers.get).
      // We need to approximate this case insensitivity, at least in functionality.
      const responseHeaders = Object.keys(response.headers).reduce((acc, header) => {
        const ret = acc;
        ret[header.toLowerCase()] = response.headers[header];
        return ret;
      }, {});
      const responseBody = response.body || null;
      const status = response.status;

      return {
        status,
        headers: {
          has: header => !!responseHeaders[header.toLowerCase()],
          get: header => responseHeaders[header.toLowerCase()] || '',
        },
        text: () => Promise.resolve(responseBody),
        json: () => Promise.resolve(JSON.parse(responseBody)),
      };
    });
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
  parseUrl,
  WebSocket,
  base64Decode: b64DecodeUnicode,
  base64Encode: b64EncodeUnicode,
  parseQuery: qs.parse,
  stringifyQuery: qs.stringify,
  fetch: scriptFetch,
});

function FluxSdk(clientId, options = {}) {
  return new WrappedFluxSdk(clientId, { ...options, implicit: true });
}

FluxSdk.handleCredentials = handleCredentials;

module.exports = FluxSdk;
