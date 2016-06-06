import { getAuthorizeUrl } from '../../../src/open-id-connect';

import * as qs from '../../../src/ports/querystring';

describe('openIdConnect.getAuthorizeUrl', function() {
  beforeEach(function() {
    spyOn(qs, 'stringifyQuery').and.returnValue('?STRINGIFIED_QUERY');
  });

  describe('when no state is provided', function() {
    it('should throw an error', function() {
      expect(() => getAuthorizeUrl('', 'FAKE_NONCE', 'FAKE_REDIRECT_URI', 'FAKE_CLIENT_ID'))
        .toThrowError('No `state` provided');
    });
  });

  describe('when no nonce is provided', function() {
    it('should throw an error', function() {
      expect(() => getAuthorizeUrl('FAKE_STATE', '', 'FAKE_CLIENT_ID', 'FAKE_REDIRECT_URI'))
        .toThrowError('No `nonce` provided');
    });
  });

  describe('when no client ID is provided', function() {
    it('should throw an error', function() {
      expect(() => getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', '', 'FAKE_REDIRECT_URI'))
        .toThrowError('No `clientId` provided');
    });
  });

  describe('when no redirect URI is provided', function() {
    it('should throw an error', function() {
      expect(() => getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', 'FAKE_CLIENT_ID'))
        .toThrowError('No `redirectUri` provided');
    });
  });

  describe('for server (non-implicit) flow', function() {
    it('should return the authorize URL with response_type `code`', function() {
      const authorizeUrl = getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', 'CLIENT_ID', 'REDIRECT_URI');

      expect(qs.stringifyQuery).toHaveBeenCalledWith({
        state: 'FAKE_STATE',
        nonce: 'FAKE_NONCE',
        client_id: 'CLIENT_ID',
        redirect_uri: 'REDIRECT_URI',
        response_type: 'code',
        scope: 'openid profile email',
      });
      expect(authorizeUrl).toEqual('https://flux.io/authorize?STRINGIFIED_QUERY');
    });

    it('should be able to override the flux URL', function() {
      const authorizeUrl = getAuthorizeUrl('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
        fluxUrl: 'https://FAKE_FLUX_URL',
      });

      expect(authorizeUrl).toEqual('https://FAKE_FLUX_URL/authorize?STRINGIFIED_QUERY');
    });
  });

  describe('for implicit flow', function() {
    it('should return the authorize URL with response_type `id_token token`', function() {
      const authorizeUrl = getAuthorizeUrl('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
        implicit: true,
      });

      expect(qs.stringifyQuery).toHaveBeenCalledWith({
        state: 'STATE',
        nonce: 'NONCE',
        client_id: 'CLIENT_ID',
        redirect_uri: 'REDIRECT_URI',
        response_type: 'id_token token',
        scope: 'openid profile email',
      });
      expect(authorizeUrl).toEqual('https://flux.io/authorize?STRINGIFIED_QUERY');
    });

    it('should be able to override the flux URL', function() {
      const authorizeUrl = getAuthorizeUrl('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
        implicit: true,
        fluxUrl: 'https://FAKE_FLUX_URL',
      });

      expect(authorizeUrl).toEqual('https://FAKE_FLUX_URL/authorize?STRINGIFIED_QUERY');
    });
  });
});
