import FluxSdk from '../../../src/models/flux-sdk';
import * as userModule from '../../../src/models/user';
import * as schemaValidators from '../../../src/utils/schema-validators';
import * as openIdConnect from '../../../src/utils/open-id-connect';
import * as requestUtils from '../../../src/utils/request';

describe('models.FluxSdk', function() {
  beforeEach(function() {
    spyOn(schemaValidators, 'checkSdk').and.callThrough();
    spyOn(requestUtils, 'setFluxUrl');
  });

  describe('#constructor', function() {
    beforeEach(function() {
      new FluxSdk('CLIENT_ID', {
        foo: 'bar',
        fluxUrl: 'FLUX_URL',
        redirectUri: 'REDIRECT_URI',
        clientSecret: 'CLIENT_SECRET',
      });
    });

    it('should validate the parameters, including all options', function() {
      expect(schemaValidators.checkSdk).toHaveBeenCalledWith({
        foo: 'bar',
        clientId: 'CLIENT_ID',
        fluxUrl: 'FLUX_URL',
        redirectUri: 'REDIRECT_URI',
        clientSecret: 'CLIENT_SECRET',
      });
    });

    it('should set the fluxUrl', function() {
      expect(requestUtils.setFluxUrl).toHaveBeenCalledWith('FLUX_URL');
    });
  });

  describe('#getAuthorizeUrl', function() {
    describe('when no state is provided', function() {
      it('should throw an error', function() {
        const sdk = new FluxSdk('CLIENT_ID', { clientSecret: 'CLIENT_SECRET' });
        expect(() => sdk.getAuthorizeUrl('', 'EXPECTED_NONCE'))
          .toThrowError('No `state` provided');
      });
    });

    describe('when no nonce is provided', function() {
      it('should throw an error', function() {
        const sdk = new FluxSdk('CLIENT_ID', { clientSecret: 'CLIENT_SECRET' });
        expect(() => sdk.getAuthorizeUrl('EXPECTED_STATE', ''))
          .toThrowError('No `nonce` provided');
      });
    });

    describe('server flow', function() {
      beforeEach(function() {
        this.sdk = new FluxSdk('CLIENT_ID', {
          clientId: 'CLIENT_ID',
          clientSecret: 'CLIENT_SECRET',
          redirectUri: 'REDIRECT_URI',
        });
        spyOn(openIdConnect, 'getServerAuthorizeUrl').and.returnValue('SERVER_URL');
      });

      it('should return the server authorize URL', function() {
        const authorizeUrl = this.sdk.getAuthorizeUrl('STATE', 'NONCE');

        expect(openIdConnect.getServerAuthorizeUrl)
          .toHaveBeenCalledWith('STATE', 'NONCE', jasmine.objectContaining({
            clientId: 'CLIENT_ID',
            redirectUri: 'REDIRECT_URI',
          }));
        expect(authorizeUrl).toEqual('SERVER_URL');
      });


      it('should be able to override the redirect URI', function() {
        this.sdk.getAuthorizeUrl('STATE', 'NONCE', { redirectUri: 'OVERRIDDEN_REDIRECT_URI' });
        expect(openIdConnect.getServerAuthorizeUrl)
          .toHaveBeenCalledWith('STATE', 'NONCE', jasmine.objectContaining({
            clientId: 'CLIENT_ID',
            redirectUri: 'OVERRIDDEN_REDIRECT_URI',
          }));
      });
    });
  });

  describe('#exchangeCredentials', function() {
    describe('without an expected state', function() {
      it('should reject with an error', function(done) {
        const sdk = new FluxSdk('CLIENT_ID', { clientSecret: 'CLIENT_SECRET' });
        sdk.exchangeCredentials('', 'EXPECTED_NONCE', {})
          .then(done.fail)
          .catch(err => {
            expect(err).toEqual('No `expectedState` provided');
            done();
          });
      });
    });

    describe('without an expectedNonce', function() {
      it('should reject with an error', function(done) {
        const sdk = new FluxSdk('CLIENT_ID', { clientSecret: 'CLIENT_SECRET' });
        sdk.exchangeCredentials('EXPECTED_STATE', '', {})
          .then(done.fail)
          .catch(err => {
            expect(err).toEqual('No `expectedNonce` provided');
            done();
          });
      });
    });

    describe('when the expected state does not match the actual state', function() {
      it('should reject with an error', function(done) {
        const sdk = new FluxSdk('CLIENT_ID', { clientSecret: 'CLIENT_SECRET' });
        sdk.exchangeCredentials('EXPECTED_STATE', 'EXPECTED_NONCE', {
          state: 'ACTUAL_STATE',
        })
          .then(done.fail)
          .catch(err => {
            expect(err).toEqual('Expected state `ACTUAL_STATE` to match `EXPECTED_STATE`');
            done();
          });
      });
    });

    describe('implicit flow', function() {
      it('should use the implicit flow to request credentials', function() {
        pending('TODO');
      });

      it('should handle the response', function() {
        pending('TODO');
      });

      it('should resolve to the handled credentials', function() {
        pending('TODO');
      });
    });

    describe('server flow', function() {
      beforeEach(function(done) {
        this.sdk = new FluxSdk('CLIENT_ID', {
          clientId: 'CLIENT_ID',
          clientSecret: 'CLIENT_SECRET',
          redirectUri: 'REDIRECT_URI',
        });
        spyOn(openIdConnect, 'requestServerCredentials')
          .and.returnValue(Promise.resolve('SERVER_CREDENTIALS'));
        spyOn(openIdConnect, 'handleCredentials')
          .and.returnValue(Promise.resolve('HANDLED_CREDENTIALS'));

        this.sdk.exchangeCredentials('STATE', 'NONCE', {
          code: 'CODE',
          state: 'STATE',
          flux_token: 'FLUX_TOKEN',
        })
          .then(response => { this.response = response; })
          .then(done, done.fail);
      });

      it('should use the server flow to request credentials', function() {
        expect(openIdConnect.requestServerCredentials).toHaveBeenCalledWith({
          clientId: 'CLIENT_ID',
          clientSecret: 'CLIENT_SECRET',
          code: 'CODE',
          redirectUri: 'REDIRECT_URI',
        });
      });

      it('should handle the server response', function() {
        expect(openIdConnect.handleCredentials)
          .toHaveBeenCalledWith('CLIENT_ID', 'FLUX_TOKEN', 'NONCE', 'SERVER_CREDENTIALS', false);
      });

      it('should resolve to the handled credentials', function() {
        expect(this.response).toEqual('HANDLED_CREDENTIALS');
      });
    });
  });

  describe('#getUser', function() {
    beforeEach(function() {
      this.fakeUser = {};
      this.sdk = new FluxSdk('CLIENT_ID', {
        clientSecret: 'CLIENT_SECRET',
      });
      spyOn(userModule, 'default').and.returnValue(this.fakeUser);
    });

    it('should use the supplied credentials to instantiate a user', function() {
      const user = this.sdk.getUser({ fakeCredential: 'CREDENTIALS' });

      expect(userModule.default)
        .toHaveBeenCalledWith({ fakeCredential: 'CREDENTIALS' });
      expect(user).toBe(this.fakeUser);
    });
  });
});
