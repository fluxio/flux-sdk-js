import { checkSdk } from '../utils/schema-validators';
import {
  getImplicitAuthorizeUrl,
  getServerAuthorizeUrl,
  requestServerCredentials,
  handleCredentials,
} from '../utils/open-id-connect';
import { parseQuery } from '../ports/querystring';
import User from './user';
import * as models from './index';
import * as constants from '../constants';
import { setFluxUrl } from '../utils/request';

// TODO: Investigate these keys re: necessity, usefulness
/*
 DeveloperId
 DeveloperName
 ClientName
 OS
 HostProgramVersion
 HostProgramMainFile
 */

function FluxSdk(clientId, sdkOptions = {}) {
  const {
    clientSecret,
    fluxUrl,
    redirectUri,
    implicit,
  } = sdkOptions;
  checkSdk({ clientId, ...sdkOptions });

  setFluxUrl(fluxUrl);

  function getAuthorizeUrl(state, nonce, options = {}) {
    if (!state) {
      throw new Error('No `state` provided');
    } else if (!nonce) {
      throw new Error('No `nonce` provided');
    }

    return (implicit ? getImplicitAuthorizeUrl : getServerAuthorizeUrl)(state, nonce, {
      fluxUrl,
      clientId,
      redirectUri: options.redirectUri || redirectUri,
    });
  }

  function exchangeCredentials(expectedState, nonce, responseQuery = {}, options = {}) {
    const {
      code,
      state,
      flux_token,
      ...others,
    } = implicit ? parseQuery(window.location.hash.slice(1)) : responseQuery;

    if (!expectedState) {
      return Promise.reject('No `expectedState` provided');
    } else if (!nonce) {
      return Promise.reject('No `expectedNonce` provided');
    } else if (expectedState !== state) {
      return Promise.reject(`Expected state \`${state}\` to match \`${expectedState}\``);
    }

    return (implicit ? Promise.resolve(others) : requestServerCredentials({
      clientId,
      clientSecret,
      code,
      redirectUri: options.redirectUri || redirectUri,
    }))
      .then(response => handleCredentials(clientId, flux_token, nonce, response, !!implicit));
  }

  function getUser(credentials) {
    return new User(credentials);
  }

  this.getAuthorizeUrl = getAuthorizeUrl;
  this.exchangeCredentials = exchangeCredentials;
  this.getUser = getUser;
}

Object.keys(models).forEach(key => { FluxSdk.prototype[key] = models[key]; });
FluxSdk.prototype.constants = constants;

export default FluxSdk;
