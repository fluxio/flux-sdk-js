import jws from 'jws';

import {
  getServerAuthorizeUrl,
  getImplicitAuthorizeUrl,
  requestServerCredentials,
  handleCredentials,
} from '../../../src/utils/open-id-connect';
import * as qs from '../../../src/ports/querystring';
import * as base64 from '../../../src/ports/base64';
import * as url from '../../../src/ports/url';
import * as requestUtils from '../../../src/utils/request';
import * as typeCheckers from '../../../src/utils/schema-validators';
import FLUX_PUBLIC_KEY from '../../../src/constants/flux-public-key';

import { version } from '../../../package.json';

describe('utils.openIdConnect', function() {
  beforeEach(function() {
    spyOn(qs, 'stringifyQuery').and.returnValue('STRINGIFIED_QUERY');
    spyOn(url, 'joinUrl').and.returnValue('JOINED_URL');
  });

  describe('#getServerAuthorizeUrl', function() {
    it('should return the authorize URL with response_type `code`', function() {
      const authorizeUrl = getServerAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        clientId: 'CLIENT_ID',
        redirectUri: 'REDIRECT_URI',
      });

      expect(qs.stringifyQuery).toHaveBeenCalledWith({
        state: 'FAKE_STATE',
        nonce: 'FAKE_NONCE',
        client_id: 'CLIENT_ID',
        redirect_uri: 'REDIRECT_URI',
        response_type: 'code',
        scope: 'openid profile email',
      });
      expect(url.joinUrl)
        .toHaveBeenCalledWith('https://flux.io/', 'authorize/', 'STRINGIFIED_QUERY');
      expect(authorizeUrl).toEqual('JOINED_URL');
    });

    it('should be able to override the flux URL', function() {
      const authorizeUrl = getServerAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        fluxUrl: 'FLUX_URL',
      });

      expect(url.joinUrl).toHaveBeenCalledWith('FLUX_URL', 'authorize/', 'STRINGIFIED_QUERY');
      expect(authorizeUrl).toEqual('JOINED_URL');
    });
  });

  describe('#getImplicitAuthorizeUrl', function() {
    it('should return the authorize URL with response_type `id_token token`', function() {
      const authorizeUrl = getImplicitAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        clientId: 'CLIENT_ID',
        redirectUri: 'REDIRECT_URI',
      });

      expect(qs.stringifyQuery).toHaveBeenCalledWith({
        state: 'FAKE_STATE',
        nonce: 'FAKE_NONCE',
        client_id: 'CLIENT_ID',
        redirect_uri: 'REDIRECT_URI',
        response_type: 'id_token token',
        scope: 'openid profile email',
      });
      expect(url.joinUrl)
        .toHaveBeenCalledWith('https://flux.io/', 'authorize/', 'STRINGIFIED_QUERY');
      expect(authorizeUrl).toEqual('JOINED_URL');
    });

    it('should be able to override the flux URL', function() {
      const authorizeUrl = getImplicitAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        fluxUrl: 'FLUX_URL',
      });

      expect(url.joinUrl)
        .toHaveBeenCalledWith('FLUX_URL', 'authorize/', 'STRINGIFIED_QUERY');
      expect(authorizeUrl).toEqual('JOINED_URL');
    });
  });

  describe('#requestServerCredentials', function() {
    beforeEach(function() {
      spyOn(requestUtils, 'request').and.returnValue('FAKE_REQUEST');
      spyOn(base64, 'base64Encode').and.returnValue('BASE64_ENCODED');
    });

    it('should return an access token request', function() {
      const accessTokenRequest = requestServerCredentials({
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        code: 'FAKE_CODE',
        redirectUri: 'REDIRECT_URI',
      });

      expect(base64.base64Encode).toHaveBeenCalledWith('CLIENT_ID:CLIENT_SECRET');
      expect(requestUtils.request).toHaveBeenCalledWith('api/token/', {
        method: 'POST',
        query: {
          code: 'FAKE_CODE',
          grant_type: 'authorization_code',
          redirect_uri: 'REDIRECT_URI',
        },
        headers: {
          Authorization: 'Basic BASE64_ENCODED',
        },
      });
      expect(accessTokenRequest).toEqual('FAKE_REQUEST');
    });

    describe('when a fluxUrl is provided', function() {
      it('should override the flux URL', function() {
        requestServerCredentials({
          fluxUrl: 'FLUX_URL',
          clientId: 'CLIENT_ID',
          clientSecret: 'CLIENT_SECRET',
          code: 'FAKE_CODE',
          redirectUri: 'REDIRECT_URI',
        });

        expect(requestUtils.request).toHaveBeenCalledWith('api/token/', {
          fluxUrl: 'FLUX_URL',
          method: 'POST',
          query: {
            code: 'FAKE_CODE',
            grant_type: 'authorization_code',
            redirect_uri: 'REDIRECT_URI',
          },
          headers: {
            Authorization: 'Basic BASE64_ENCODED',
          },
        });
      });
    });
  });

  describe('#handleCredentials', function() {
    beforeEach(function() {
      spyOn(jws, 'decode');
    });

    describe('when the response does not have a valid id_token', function() {
      beforeEach(function() {
        jws.decode.and.returnValue(null);
      });

      it('should reject with an error', function(done) {
        handleCredentials('CLIENT_ID', 'FLUX_TOKEN', 'EXPECTED_NONCE', {
          id_token: 'INVALID_ID_TOKEN',
        })
          .then(done.fail)
          .catch(err => {
            expect(jws.decode).toHaveBeenCalledWith('INVALID_ID_TOKEN');
            expect(err).toEqual('Response is missing a valid `id_token`');

            done();
          });
      });
    });

    describe('when the id_token fails verification', function() {
      beforeEach(function() {
        jws.decode.and.returnValue({
          header: { alg: 'ID_TOKEN_ALG' },
        });
        spyOn(jws, 'verify').and.returnValue(false);
      });

      it('should reject with an error', function(done) {
        handleCredentials('CLIENT_ID', 'FLUX_TOKEN', 'EXPECTED_NONCE', {
          id_token: 'UNVERIFIED_ID_TOKEN',
        })
          .then(done.fail)
          .catch(err => {
            expect(jws.verify).toHaveBeenCalledWith(
              'UNVERIFIED_ID_TOKEN', 'ID_TOKEN_ALG', FLUX_PUBLIC_KEY
            );
            expect(err).toEqual('`id_token` from response failed verification');

            done();
          });
      });
    });

    describe('when the expected and actual nonce values are not equal', function() {
      beforeEach(function() {
        jws.decode.and.returnValue({
          header: { alg: 'ALG' },
          payload: { nonce: 'ACTUAL_NONCE' },
        });
        spyOn(jws, 'verify').and.returnValue(true);
      });

      it('should reject with an error', function(done) {
        handleCredentials('CLIENT_ID', 'FLUX_TOKEN', 'EXPECTED_NONCE', {
          id_token: 'BAD_NONCE_ID_TOKEN',
        })
          .then(done.fail)
          .catch(err => {
            expect(err).toEqual('Expected nonce `ACTUAL_NONCE` to equal `EXPECTED_NONCE`');
            done();
          });
      });
    });

    describe('when the response has a valid id_token', function() {
      beforeEach(function(done) {
        this.decodedIdToken = {
          header: { alg: 'ID_TOKEN_ALG' },
          payload: {
            exp: 12345,
            nonce: 'GOOD_NONCE',
          },
        };
        jws.decode.and.returnValue(this.decodedIdToken);
        spyOn(jws, 'verify').and.returnValue(true);
        spyOn(typeCheckers, 'checkCredentials').and.callThrough();

        handleCredentials('CLIENT_ID', 'FLUX_TOKEN', 'GOOD_NONCE', {
          id_token: 'ENCODED_ID_TOKEN',
          access_token: 'ACCESS_TOKEN',
          token_type: 'TOKEN_TYPE',
          scope: 'SCOPE',
          refresh_token: 'REFRESH_TOKEN',
        })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should have verified the id_token', function() {
        expect(jws.verify).toHaveBeenCalledWith(
          'ENCODED_ID_TOKEN', 'ID_TOKEN_ALG', FLUX_PUBLIC_KEY
        );
      });

      it('should check the credentials', function() {
        expect(typeCheckers.checkCredentials).toHaveBeenCalledWith({
          clientId: 'CLIENT_ID',
          fluxToken: 'FLUX_TOKEN',
          idToken: this.decodedIdToken,
          scope: 'SCOPE',
          accessToken: 'ACCESS_TOKEN',
          refreshToken: 'REFRESH_TOKEN',
          tokenExpiry: 12345,
          tokenType: 'TOKEN_TYPE',
          clientInfo: {
            ClientId: 'CLIENT_ID',
            ClientVersion: '',
            AdditionalClientData: {
              HostProgramVersion: 'unknown',
              HostProgramMainFile: 'web',
            },
            SDKName: 'Flux Javascript SDK',
            SDKVersion: version,
          },
        });
      });

      it('should resolve to credentials', function() {
        expect(this.response).toEqual({
          clientId: 'CLIENT_ID',
          fluxToken: 'FLUX_TOKEN',
          idToken: this.decodedIdToken,
          scope: 'SCOPE',
          accessToken: 'ACCESS_TOKEN',
          refreshToken: 'REFRESH_TOKEN',
          tokenExpiry: 12345,
          tokenType: 'TOKEN_TYPE',
          clientInfo: {
            ClientId: 'CLIENT_ID',
            ClientVersion: '',
            AdditionalClientData: {
              HostProgramVersion: 'unknown',
              HostProgramMainFile: 'web',
            },
            SDKName: 'Flux Javascript SDK',
            SDKVersion: version,
          },
        });
      });
    });
  });
});
