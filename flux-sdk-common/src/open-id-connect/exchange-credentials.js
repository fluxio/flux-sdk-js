import handleCredentials from './handle-credentials';
import { request } from '../utils/request';
import { base64Encode } from '../ports/base64';

import { ACCESS_TOKEN_PATH } from '../constants/paths';

function retrieveServerCredentials(clientId, clientSecret, redirectUri, code, options = {}) {
  const encodedAuth = base64Encode(`${clientId}:${clientSecret}`);

  return request(ACCESS_TOKEN_PATH, {
    method: 'post',
    query: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    },
    headers: {
      Authorization: `Basic ${encodedAuth}`,
    },
  }, { fluxUrl: options.fluxUrl || '' });
}

function exchangeCredentials(state, nonce, clientId, redirectUri, query = {}, options = {}) {
  const implicit = !!options.implicit;
  let result = null;
  let error = null;

  if (!state) {
    error = 'No `state` provided';
  } else if (!nonce) {
    error = 'No `nonce` provided';
  } else if (!clientId) {
    error = 'No `clientId` provided';
  } else if (!redirectUri) {
    error = 'No `redirectUri` provided';
  } else if (state !== query.state) {
    error = `Expected state \`${query.state}\` from server to match \`${state}\``;
  }

  if (!error) {
    const credentialsPromise = implicit ? Promise.resolve(query) :
      retrieveServerCredentials(clientId, options.clientSecret, redirectUri, query.code, options);

    result = credentialsPromise
      .then(response => handleCredentials(clientId, query.flux_token, nonce, response, implicit));
  } else {
    result = Promise.reject(error);
  }

  return result;
}

export default exchangeCredentials;
