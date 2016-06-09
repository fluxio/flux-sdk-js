import jws from 'jws';

import { request } from '../utils/request';
import { checkCredentials } from '../utils/schema-validators';
import { parseQuery, stringifyQuery } from '../ports/querystring';
import { parseUrl, joinUrl } from '../ports/url';
import { base64Encode } from '../ports/base64';
import {
  FLUX_URL,
  AUTHORIZE_PATH,
  ACCESS_TOKEN_PATH,
} from '../constants/paths';
import FLUX_PUBLIC_KEY from '../constants/flux-public-key';

import { version } from '../../package.json';

const SCOPE = 'openid profile email';

function getAuthorizeUrl(responseType, state, nonce, { fluxUrl, clientId, redirectUri }) {
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

function getServerAuthorizeUrl(...args) {
  return getAuthorizeUrl('code', ...args);
}

function getImplicitAuthorizeUrl(...args) {
  return getAuthorizeUrl('id_token token', ...args);
}

function handleCredentials(clientId, fluxToken, expectedNonce, response, implicit) {
  const { id_token, access_token, token_type, scope, refresh_token } = response;
  const idToken = jws.decode(id_token);
  if (!idToken) {
    return Promise.reject('Response is missing a valid `id_token`');
  // TODO: Verify the token in implicit flows
  } else if (!implicit && !jws.verify(id_token, idToken.header.alg, FLUX_PUBLIC_KEY)) {
    return Promise.reject('`id_token` from response failed verification');
  } else if (idToken.payload.nonce !== expectedNonce) {
    return Promise.reject(
      `Expected nonce \`${idToken.payload.nonce}\` to equal \`${expectedNonce}\``
    );
  }

  const credentials = {
    clientId,
    fluxToken,
    idToken,
    scope,
    accessToken: access_token,
    refreshToken: refresh_token,
    tokenExpiry: idToken.payload.exp,
    tokenType: token_type,
    clientInfo: {
      ClientId: clientId,
      ClientVersion: '',
      AdditionalClientData: {
        HostProgramVersion: 'unknown',
        HostProgramMainFile: 'web',
      },
      SDKName: 'Flux Javascript SDK',
      SDKVersion: version,
    },
  };
  checkCredentials(credentials);

  return Promise.resolve(credentials);
}

function requestServerCredentials({ fluxUrl, clientId, clientSecret, code, redirectUri }) {
  const authorization = base64Encode(`${clientId}:${clientSecret}`);
  const options = fluxUrl ? { fluxUrl } : {};
  return request(ACCESS_TOKEN_PATH, {
    ...options,
    method: 'POST',
    query: {
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    },
    headers: {
      Authorization: `Basic ${authorization}`,
    },
  })
    ;
}

function retrieveImplicitCredentials(clientId, expectedState, expectedNonce) {
  const {
    state,
    flux_token,
    ...others,
  } = parseQuery(parseUrl(window.location).hash);
  if (state !== expectedState) {
    return Promise.reject(`Expected state \`${state}\` to match \`${expectedState}\``);
  }

  return handleCredentials(clientId, flux_token, expectedNonce, others);
}

export {
  getServerAuthorizeUrl,
  getImplicitAuthorizeUrl,
  requestServerCredentials,
  retrieveImplicitCredentials,
  handleCredentials,
};
