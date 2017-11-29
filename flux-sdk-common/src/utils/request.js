import { FLUX_URL } from '../constants/paths';
import { fetch } from '../ports/fetch';
import { joinUrl } from '../ports/url';
import { base64Decode, base64Encode } from '../ports/base64';
import { stringifyQuery } from '../ports/querystring';
import { USER_AGENT, PLATFORM } from '../config';

const EMPTY_BODY = null;

let fluxUrl = FLUX_URL;

function decodeHeader(header) {
  return JSON.parse(base64Decode(header));
}

function createAuthHeaders({ tokenType, accessToken, fluxToken, clientId }) {
  return {
    Authorization: `${tokenType} ${accessToken}`,
    Cookie: `auth=${accessToken}; flux_token=${fluxToken}`,
    'Flux-Request-Token': fluxToken,
    'Flux-Request-Marker': 1,
    'Flux-Plugin-Host': clientId,
  };
}

function handleJson(response) {
  const jsonPromise = response.json();
  if (jsonPromise) {
    return jsonPromise.catch(() => EMPTY_BODY);
  }
  return new Promise((resolve) => { resolve(EMPTY_BODY); });
}

function handleAuxiliaryResponse(response) {
  const auxiliaryHeader = response.headers.get('flux-auxiliary-return');
  const auxiliary = decodeHeader(auxiliaryHeader);
  return auxiliary ? handleJson(response)
    .then(value => ({
      value,
      ...auxiliary,
    })) : handleJson(response);
}

// Returns the response body as a stream.
function handleImage(response) {
  const content = response.headers.get('content-type');
  const snapshot = response.body;
  return new Promise((resolve) => {
    snapshot.on('readable', () => {
      const buffer = snapshot.read();
      if (buffer !== null && buffer !== undefined) {
        const str64 = buffer.toString('base64');
        const img = `data:${content};base64,${str64}`;
        resolve(img);
      }
    });
  });
}

function handleSuccess(response) {
  const headers = response.headers;
  if (headers.has('content-type') && headers.get('content-type').slice(0, 5) === 'image') {
    return handleImage(response);
  }
  return headers.has('flux-auxiliary-return') ?
    handleAuxiliaryResponse(response) : handleJson(response);
}

function handleError(response) {
  return response.text()
    .then(text => {
      const status = response.status;
      const error = new Error(`${status}: ${text}`);

      error.response = response;
      error.status = status;

      throw error;
    });
}

function handleResponse(response) {
  const status = response.status;
  const isError = status < 200 || status >= 300;
  return isError ? handleError(response) : handleSuccess(response);
}

function request(path, options = {}) {
  const { query, body, form, headers: _, ...others } = options;
  let headers = options.headers;
  if (!headers) {
    headers = {};
  }
  let payload;
  if (form) {
    const formEnc = form.constructor === Object ? urlEncodeObject(form) : form;
    payload = { body: formEnc };
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else {
    if (Object.keys(headers).map((h) => h.toLowerCase()).indexOf('content-type') < 0) {
      payload = body === undefined ? null : { body: JSON.stringify(body) };
      if (payload) {
        headers['Content-Type'] = 'application/json';
      }
    } else {
      payload = { body };
    }
  }
  const search = query ? stringifyQuery(query) : '';
  return fetch(joinUrl(others.fluxUrl || fluxUrl, path, search), {
    ...others,
    credentials: 'include',
    headers: {
      'User-Agent': USER_AGENT,
      'Flux-Plugin-Platform': PLATFORM,
      ...headers,
    },
    ...payload,
  })
    .then(handleResponse);
}

function urlEncodeObject(obj) {
  const result = [];
  const keys = Object.keys(obj);
  for (let i = 0, len = keys.length; i < len; i++) {
    result.push([encodeURIComponent(keys[i]), encodeURIComponent(obj[keys[i]])].join('='));
  }
  return result.join('&');
}

function createFluxOptionsHeader({ clientInfo }, fluxOptions) {
  return fluxOptions ? {
    'Flux-Options': base64Encode(JSON.stringify({
      ClientInfo: clientInfo,
      ...fluxOptions,
    })),
  } : null;
}

function authenticatedRequest(credentials, path, options = {}) {
  const { headers, fluxOptions, ...others } = options;
  return request(path, {
    headers: {
      ...createFluxOptionsHeader(credentials, fluxOptions),
      ...createAuthHeaders(credentials),
      ...headers,
    },
    ...others,
  });
}

function setFluxUrl(url) {
  fluxUrl = url || FLUX_URL;
}

export {
  createAuthHeaders,
  request,
  authenticatedRequest,
  setFluxUrl,
};
