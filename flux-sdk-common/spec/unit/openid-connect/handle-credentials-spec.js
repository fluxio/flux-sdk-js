import jws from 'jws';

import handleCredentials from '../../../src/open-id-connect/handle-credentials';
import * as typeCheckers from '../../../src/utils/schema-validators';
import FLUX_PUBLIC_KEY from '../../../src/constants/flux-public-key';

import { version } from '../../../package.json';

describe('openIdConnect.handleCredentials', function() {
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
        .then(response => {
          this.response = response;
        })
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
          SDKName: 'Flux Javascript SDK',
          SDKVersion: version,
          OS: `browser/js-sdk/${version}`,
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
          SDKName: 'Flux Javascript SDK',
          SDKVersion: version,
          OS: `browser/js-sdk/${version}`,
        },
      });
    });
  });
});
