import jws from 'jws';

import { checkCredentials } from '../utils/schema-validators';
import FLUX_PUBLIC_KEY from '../constants/flux-public-key';

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
      SDKVersion: '0.3.0',
    },
  };
  checkCredentials(credentials);

  return Promise.resolve(credentials);
}

export default handleCredentials;
