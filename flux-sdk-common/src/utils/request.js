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
  return response.json()
    .catch(() => EMPTY_BODY);
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

function handleSuccess(response) {
  const headers = response.headers;
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
  const { query, body, headers, form, ...others } = options;
  let payload;
  let contentType;
  if (form && form.constructor === String) {
    payload = { body: form };
    contentType = { 'Content-Type': 'application/x-www-form-urlencoded' };
  } else {
    payload = body === undefined ? null : { body: JSON.stringify(body) };
    contentType = payload ? { 'Content-Type': 'application/json' } : null;
  }
  const search = query ? stringifyQuery(query) : '';

  return fetch(joinUrl(others.fluxUrl || fluxUrl, path, search), {
    credentials: 'include',
    headers: {
      ...headers,
      ...contentType,
      'User-Agent': USER_AGENT,
      'Flux-Plugin-Platform': PLATFORM,
    },
    ...payload,
    ...others,
  })
    .then(handleResponse);
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
