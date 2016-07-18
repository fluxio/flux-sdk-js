import { checkSdk } from '../utils/schema-validators';
import {
  getAuthorizeUrl as _getAuthorizeUrl,
  exchangeCredentials as _exchangeCredentials,
} from '../open-id-connect';
import { parseQuery } from '../ports/querystring';
import User from './user';
import * as models from './index';
import * as constants from '../constants';
import { setFluxUrl } from '../utils/request';

import { VERSION } from '../config';

function FluxSdk(clientId, sdkOptions = {}) {
  const {
    fluxUrl,
    redirectUri,
    implicit,
    clientSecret,
  } = sdkOptions;
  checkSdk({ clientId, ...sdkOptions });

  setFluxUrl(fluxUrl);

  function getAuthorizeUrl(state, nonce, options = {}) {
    return _getAuthorizeUrl(state, nonce, clientId, options.redirectUri || redirectUri, {
      fluxUrl: options.fluxUrl || fluxUrl || '',
      implicit: !!implicit,
    });
  }

  function exchangeCredentials(state, nonce, responseQuery = {}, options = {}) {
    const query = implicit ? parseQuery(window.location.hash.slice(1)) : responseQuery;
    const redirect = options.redirectUri || redirectUri;

    return _exchangeCredentials(state, nonce, clientId, redirect, query, {
      fluxUrl,
      clientSecret,
      implicit: !!implicit,
    });
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

FluxSdk.prototype.version = FluxSdk.version = VERSION;

export default FluxSdk;
