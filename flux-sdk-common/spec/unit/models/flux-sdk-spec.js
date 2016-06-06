import FluxSdk from '../../../src/models/flux-sdk';
import * as userModule from '../../../src/models/user';
import * as schemaValidators from '../../../src/utils/schema-validators';
import * as openIdConnect from '../../../src/open-id-connect';
import * as requestUtils from '../../../src/utils/request';
import * as queryStringModule from '../../../src/ports/querystring';

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
    beforeEach(function() {
      spyOn(openIdConnect, 'getAuthorizeUrl').and.returnValue('FAKE_AUTHORIZE_URL');
    });

    it('should return the authorize URL', function() {
      const sdk = new FluxSdk('CLIENT_ID', {
        redirectUri: 'FAKE_REDIRECT_URI',
        clientSecret: 'FAKE_SECRET',
      });
      const authorizeUrl = sdk.getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE');

      expect(authorizeUrl).toEqual('FAKE_AUTHORIZE_URL');
      expect(openIdConnect.getAuthorizeUrl)
        .toHaveBeenCalledWith('FAKE_STATE', 'FAKE_NONCE', 'CLIENT_ID', 'FAKE_REDIRECT_URI', {
          fluxUrl: '',
          implicit: false,
        });
    });

    it('should allow the user to override the redirect URI', function() {
      const sdk = new FluxSdk('CLIENT_ID', {
        redirectUri: 'FAKE_REDIRECT_URI',
        clientSecret: 'FAKE_SECRET',
      });
      const authorizeUrl = sdk.getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        redirectUri: 'DIFFERENT_REDIRECT_URI',
      });

      expect(authorizeUrl).toEqual('FAKE_AUTHORIZE_URL');
      expect(openIdConnect.getAuthorizeUrl)
        .toHaveBeenCalledWith('FAKE_STATE', 'FAKE_NONCE', 'CLIENT_ID', 'DIFFERENT_REDIRECT_URI', {
          fluxUrl: '',
          implicit: false,
        });
    });

    it('should allow the user to override the Flux URL', function() {
      const sdk = new FluxSdk('CLIENT_ID', {
        redirectUri: 'FAKE_REDIRECT_URI',
        clientSecret: 'FAKE_SECRET',
      });
      const authorizeUrl = sdk.getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE', {
        fluxUrl: 'FAKE_FLUX_URL',
      });

      expect(authorizeUrl).toEqual('FAKE_AUTHORIZE_URL');
      expect(openIdConnect.getAuthorizeUrl)
        .toHaveBeenCalledWith('FAKE_STATE', 'FAKE_NONCE', 'CLIENT_ID', 'FAKE_REDIRECT_URI', {
          fluxUrl: 'FAKE_FLUX_URL',
          implicit: false,
        });
    });

    describe('when the SDK is implicit', function() {
      it('should get the implicit authorize URL', function() {
        const sdk = new FluxSdk('CLIENT_ID', {
          redirectUri: 'FAKE_REDIRECT_URI',
          implicit: true,
        });
        const authorizeUrl = sdk.getAuthorizeUrl('FAKE_STATE', 'FAKE_NONCE');

        expect(authorizeUrl).toEqual('FAKE_AUTHORIZE_URL');
        expect(openIdConnect.getAuthorizeUrl)
          .toHaveBeenCalledWith('FAKE_STATE', 'FAKE_NONCE', 'CLIENT_ID', 'FAKE_REDIRECT_URI', {
            fluxUrl: '',
            implicit: true,
          });
      });
    });
  });

  describe('#exchangeCredentials', function() {
    beforeEach(function() {
      spyOn(openIdConnect, 'exchangeCredentials').and.returnValue('EXCHANGED_CREDENTIALS');
    });

    describe('server (non-implicit) flow', function() {
      beforeEach(function() {
        this.sdk = new FluxSdk('CLIENT_ID', {
          clientSecret: 'CLIENT_SECRET',
          fluxUrl: 'FLUX_URL',
          redirectUri: 'REDIRECT_URI',
        });
      });

      it('should correctly request to exchange the credentials', function() {
        const credentials = this.sdk.exchangeCredentials('STATE', 'NONCE', { foo: 'bar' });

        expect(credentials).toEqual('EXCHANGED_CREDENTIALS');

        expect(openIdConnect.exchangeCredentials)
          .toHaveBeenCalledWith('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', { foo: 'bar' }, {
            clientSecret: 'CLIENT_SECRET',
            fluxUrl: 'FLUX_URL',
            implicit: false,
          });
      });

      it('should allow the user to override the redirect URI', function() {
        const credentials = this.sdk.exchangeCredentials('STATE', 'NONCE', { foo: 'bar' }, {
          redirectUri: 'DIFFERENT_REDIRECT_URI',
        });

        expect(credentials).toEqual('EXCHANGED_CREDENTIALS');

        expect(openIdConnect.exchangeCredentials)
          .toHaveBeenCalledWith('STATE', 'NONCE', 'CLIENT_ID', 'DIFFERENT_REDIRECT_URI', {
            foo: 'bar',
          }, {
            clientSecret: 'CLIENT_SECRET',
            fluxUrl: 'FLUX_URL',
            implicit: false,
          });
      });
    });

    describe('implicit flow', function() {
      beforeEach(function() {
        this.originalWindow = global.window;
        global.window = {
          location: { hash: '#UNPARSED_HASH' },
        };

        spyOn(queryStringModule, 'parseQuery').and.returnValue('PARSED_QUERY');

        this.sdk = new FluxSdk('CLIENT_ID', {
          fluxUrl: 'FLUX_URL',
          redirectUri: 'REDIRECT_URI',
          implicit: true,
        });
      });

      afterEach(function() {
        global.window = this.originalWindow;
      });

      it('should correctly request to exchange the credentials', function() {
        const credentials = this.sdk.exchangeCredentials('STATE', 'NONCE', { foo: 'bar' });

        expect(queryStringModule.parseQuery).toHaveBeenCalledWith('UNPARSED_HASH');
        expect(credentials).toEqual('EXCHANGED_CREDENTIALS');
        expect(openIdConnect.exchangeCredentials)
          .toHaveBeenCalledWith('STATE', 'NONCE', 'CLIENT_ID', 'REDIRECT_URI', 'PARSED_QUERY', {
            clientSecret: undefined,
            fluxUrl: 'FLUX_URL',
            implicit: true,
          });
      });

      it('should allow the user to override the redirect URI', function() {
        this.sdk.exchangeCredentials('STATE', 'NONCE', { foo: 'bar' }, {
          redirectUri: 'DIFFERENT_REDIRECT_URI',
        });

        expect(openIdConnect.exchangeCredentials).toHaveBeenCalledWith(
          'STATE', 'NONCE', 'CLIENT_ID', 'DIFFERENT_REDIRECT_URI', 'PARSED_QUERY', {
            clientSecret: undefined,
            fluxUrl: 'FLUX_URL',
            implicit: true,
          });
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
