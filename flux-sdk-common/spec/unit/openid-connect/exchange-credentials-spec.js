import { exchangeCredentials } from '../../../src/open-id-connect';

import * as handleCredentialsModule from '../../../src/open-id-connect/handle-credentials';
import * as qs from '../../../src/ports/querystring';
import * as base64 from '../../../src/ports/base64';
import * as requestUtils from '../../../src/utils/request';

describe('openIdConnect.exchangeCredentials', function() {
  beforeEach(function() {
    spyOn(handleCredentialsModule, 'default')
      .and.returnValue(Promise.resolve('HANDLED_CREDENTIALS'));
    spyOn(qs, 'stringifyQuery').and.returnValue('?STRINGIFIED_QUERY');
    spyOn(requestUtils, 'request').and.returnValue(Promise.resolve('SERVER_RESPONSE'));
    spyOn(base64, 'base64Encode').and.returnValue('ENCODED_AUTH');
  });

  describe('without an expected state', function() {
    it('should reject with an error', function(done) {
      const result = exchangeCredentials('', 'EXPECTED_NONCE', 'CLIENT_ID', 'REDIRECT_URI', {}, {});
      result.then(done.fail)
        .catch(err => {
          expect(err).toEqual('No `state` provided');
          done();
        });
    });
  });

  describe('without an expected nonce', function() {
    it('should reject with an error', function(done) {
      const result = exchangeCredentials('EXPECTED_STATE', '', 'CLIENT_ID', 'REDIRECT_URI', {}, {});
      result.then(done.fail)
        .catch(err => {
          expect(err).toEqual('No `nonce` provided');
          done();
        });
    });
  });

  describe('without a client ID', function() {
    it('should reject with an error', function(done) {
      const result = exchangeCredentials('STATE', 'NONCE', '', 'REDIRECT_URI', {}, {});
      result.then(done.fail)
        .catch(err => {
          expect(err).toEqual('No `clientId` provided');
          done();
        });
    });
  });

  describe('without a redirect URI', function() {
    it('should reject with an error', function(done) {
      const result = exchangeCredentials('STATE', 'NONCE', 'CLIENT_ID', '', {}, {});
      result.then(done.fail)
        .catch(err => {
          expect(err).toEqual('No `redirectUri` provided');
          done();
        });
    });
  });

  describe('when using server (non-implicit) flow', function() {
    describe('when the expected state does not match the query state', function() {
      it('should reject with an error', function(done) {
        const result = exchangeCredentials('EXPECTED_STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
          state: 'BAD_STATE',
        }, {});
        result.then(done.fail)
          .catch(err => {
            expect(err).toEqual('Expected state `BAD_STATE` from server to match `EXPECTED_STATE`');
            done();
          });
      });
    });

    describe('when the query and parameters are valid', function() {
      beforeEach(function() {
        this.result = exchangeCredentials('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
          state: 'STATE',
          code: 'RESPONSE_CODE',
          flux_token: 'FLUX_TOKEN',
        }, {
          clientSecret: 'CLIENT_SECRET',
        });
      });

      it('should request the credentials from the server', function(done) {
        this.result
          .then(() => {
            expect(base64.base64Encode).toHaveBeenCalledWith('CLIENT_ID:CLIENT_SECRET');

            expect(requestUtils.request).toHaveBeenCalledWith('api/token/', {
              method: 'post',
              query: {
                code: 'RESPONSE_CODE',
                grant_type: 'authorization_code',
                redirect_uri: 'REDIRECT_URI',
              },
              headers: {
                Authorization: 'Basic ENCODED_AUTH',
              },
            }, { fluxUrl: '' });
          })
          .then(done, done.fail);
      });

      it('should return the handled credentials', function(done) {
        this.result
          .then(credentials => {
            expect(handleCredentialsModule.default)
              .toHaveBeenCalledWith('CLIENT_ID', 'FLUX_TOKEN', 'NONCE', 'SERVER_RESPONSE', false);

            expect(credentials).toEqual('HANDLED_CREDENTIALS');
          })
          .then(done, done.fail);
      });
    });

    it('should allow the user to override the Flux URL', function(done) {
      exchangeCredentials('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
        state: 'STATE',
        code: 'RESPONSE_CODE',
        flux_token: 'FLUX_TOKEN',
      }, {
        clientSecret: 'CLIENT_SECRET',
        fluxUrl: 'FLUX_URL',
      })
        .then(() => {
          expect(requestUtils.request).toHaveBeenCalledWith('api/token/', {
            method: 'post',
            query: {
              code: 'RESPONSE_CODE',
              grant_type: 'authorization_code',
              redirect_uri: 'REDIRECT_URI',
            },
            headers: {
              Authorization: 'Basic ENCODED_AUTH',
            },
          }, { fluxUrl: 'FLUX_URL' });
        })
        .then(done, done.fail);
    });
  });

  describe('when using implicit flow', function() {
    describe('when the expected state does not match the query state', function() {
      it('should reject with an error', function(done) {
        const result = exchangeCredentials('EXPECTED_STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
          state: 'BAD_STATE',
        }, { implicit: true });

        result
          .then(done.fail)
          .catch(err => {
            expect(err).toEqual('Expected state `BAD_STATE` from server to match `EXPECTED_STATE`');
            done();
          });
      });
    });

    describe('when the query and parameters are valid', function() {
      beforeEach(function() {
        this.result = exchangeCredentials('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', {
          state: 'STATE',
          code: 'RESPONSE_CODE',
          flux_token: 'FLUX_TOKEN',
          foo: 'bar',
        }, {
          implicit: true,
        });
      });

      it('should use the query to handle the credentials', function(done) {
        this.result
          .then(credentials => {
            expect(credentials).toEqual('HANDLED_CREDENTIALS');

            expect(handleCredentialsModule.default)
              .toHaveBeenCalledWith('CLIENT_ID', 'FLUX_TOKEN', 'NONCE', {
                state: 'STATE',
                code: 'RESPONSE_CODE',
                flux_token: 'FLUX_TOKEN',
                foo: 'bar',
              }, true);
          })
          .then(done, done.fail);
      });
    });
  });
});
