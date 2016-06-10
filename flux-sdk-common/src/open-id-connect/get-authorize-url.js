import { stringifyQuery } from '../ports/querystring';
import { joinUrl } from '../ports/url';

import {
  FLUX_URL,
  AUTHORIZE_PATH,
} from '../constants/paths';

const SCOPE = 'openid profile email';

function createAuthorizeUrl(responseType, state, nonce, clientId, redirectUri, { fluxUrl }) {
  const search = stringifyQuery({
    state,
    nonce,
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope: SCOPE,
  });

  return joinUrl(fluxUrl || FLUX_URL, AUTHORIZE_PATH, search);
}

function getAuthorizeUrl(state, nonce, clientId, redirectUri, options = {}) {
  const { implicit, fluxUrl } = options;

  if (!state) {
    throw new Error('No `state` provided');
  } else if (!nonce) {
    throw new Error('No `nonce` provided');
  } else if (!clientId) {
    throw new Error('No `clientId` provided');
  } else if (!redirectUri) {
    throw new Error('No `redirectUri` provided');
  }

  const responseType = implicit ? 'id_token token' : 'code';
  return createAuthorizeUrl(responseType, state, nonce, clientId, redirectUri, { fluxUrl });
}

export default getAuthorizeUrl;
