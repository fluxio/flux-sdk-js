import {
  request,
  authenticatedRequest,
  createAuthHeaders,
  setFluxUrl,
} from '../../../src/utils/request';
import * as fetchPort from '../../../src/ports/fetch';
import * as base64 from '../../../src/ports/base64';
import * as url from '../../../src/ports/url';
import * as querystring from '../../../src/ports/querystring';
import credentialsFactory from '../../factories/credentials-factory';
import { version } from '../../../package.json';

describe('utils.request', function() {
  beforeEach(function() {
    spyOn(url, 'joinUrl').and.returnValue('JOINED_URL');
  });

  describe('#createAuthHeaders', function() {
    it('should return the necessary Flux headers', function() {
      const headers = createAuthHeaders({
        tokenType: 'TOKEN_TYPE',
        accessToken: 'ACCESS_TOKEN',
        fluxToken: 'FLUX_TOKEN',
      });

      expect(headers.Authorization).toEqual('TOKEN_TYPE ACCESS_TOKEN');
      expect(headers.Cookie).toEqual('auth=ACCESS_TOKEN; flux_token=FLUX_TOKEN');
      expect(headers['Flux-Request-Token']).toEqual('FLUX_TOKEN');
      expect(headers['Flux-Request-Marker']).toEqual(1);
    });
  });

  describe('#request', function() {
    beforeEach(function() {
      const jsonSpy = jasmine.createSpy('json');
      spyOn(fetchPort, 'fetch').and.returnValue(Promise.resolve({
        json: jsonSpy,
        headers: jasmine.createSpyObj('headers', ['has']),
      }));
    });

    describe('without a flux URL specified', function() {
      it('should use the default flux URL', function() {
        request('SOME_PATH');

        expect(url.joinUrl).toHaveBeenCalledWith(['https://flux.io/', 'SOME_PATH']);
        expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', jasmine.objectContaining({
          credentials: 'include',
        }));
      });
    });

    describe('with a flux URL specified', function() {
      beforeEach(function() {
        setFluxUrl('BASE_URL');
      });

      afterEach(function() {
        setFluxUrl();
      });

      it('should override the default flux URL', function() {
        request('SOME_PATH');

        expect(url.joinUrl).toHaveBeenCalledWith(['BASE_URL', 'SOME_PATH']);
        expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', jasmine.objectContaining({
          credentials: 'include',
        }));
      });
    });

    describe('when a query is specified', function() {
      beforeEach(function() {
        spyOn(querystring, 'stringifyQuery').and.returnValue('STRINGIFIED_QUERY');
      });

      it('should add it to the URL', function() {
        request('SOME_PATH', { query: { foo: 'bar' } });

        expect(url.joinUrl)
          .toHaveBeenCalledWith(['https://flux.io/', 'SOME_PATH', 'STRINGIFIED_QUERY']);
      });
    });

    describe('when a body is specified', function() {
      beforeEach(function() {
        request('SOME_PATH', { body: { foo: 'bar' } });
      });

      it('should send the body', function() {
        expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', jasmine.objectContaining({
          credentials: 'include',
          body: JSON.stringify({ foo: 'bar' }),
        }));
      });
    });

    describe('when a falsey body is specified', function() {
      beforeEach(function() {
        request('SOME_PATH', { body: false });
      });

      it('should send the body', function() {
        expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', jasmine.objectContaining({
          credentials: 'include',
          body: JSON.stringify(false),
        }));
      });
    });

    describe('when additional options are added', function() {
      it('should add them to the fetch request', function() {
        request('SOME_PATH', { headers: { a: 'b' }, foo: 'bar' });

        expect(url.joinUrl).toHaveBeenCalledWith(['https://flux.io/', 'SOME_PATH']);
        expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', {
          credentials: 'include',
          headers: {
            a: 'b',
            'User-Agent': `js-sdk/${version}`,
            'Flux-Plugin-Platform': `browser/js-sdk/${version}`,
          },
          foo: 'bar',
        });
      });
    });

    describe('when the request returns with an error status', function() {
      beforeEach(function() {
        this.textSpy = jasmine.createSpy('text')
          .and.returnValue(Promise.resolve('something bad happened'));
        fetchPort.fetch.and.returnValue(Promise.resolve({
          status: 500,
          text: this.textSpy,
        }));
      });

      it('should throw an error', function(done) {
        request('SOME_PATH')
          .then(done.fail)
          .catch(err => {
            expect(err.message).toEqual('500: something bad happened');
            expect(err.response).toEqual({
              status: 500,
              text: this.textSpy,
            });
            expect(err.status).toEqual(500);
            done();
          });
      });
    });

    describe('when the request returns with a valid status', function() {
      beforeEach(function() {
        const jsonSpy = jasmine.createSpy('json').and.returnValue(
          Promise.resolve({ someKey: 'I am parsed JSON!' })
        );
        this.headers = jasmine.createSpyObj('headers', ['has', 'get']);
        fetchPort.fetch.and.returnValue(Promise.resolve({
          json: jsonSpy,
          headers: this.headers,
          status: 200,
        }));
      });

      it('should resolve to the parsed response', function(done) {
        request('SOME_PATH')
          .then(response => {
            expect(this.headers.has).toHaveBeenCalledWith('flux-auxiliary-return');
            expect(response).toEqual({ someKey: 'I am parsed JSON!' });
          })
          .then(done, done.fail);
      });

      describe('when the response has an auxiliary return', function() {
        beforeEach(function() {
          this.headers.has.and.returnValue(true);
          this.headers.get.and.returnValue('AUXILIARY_RETURN');
        });

        describe('when the auxiliary return decodes to null', function() {
          beforeEach(function() {
            spyOn(base64, 'base64Decode').and.returnValue(JSON.stringify(null));
          });

          it('should return the body directly', function(done) {
            request('SOME_PATH')
              .then(response => {
                expect(base64.base64Decode).toHaveBeenCalledWith('AUXILIARY_RETURN');
                expect(this.headers.has).toHaveBeenCalledWith('flux-auxiliary-return');
                expect(this.headers.get).toHaveBeenCalledWith('flux-auxiliary-return');
                expect(response).toEqual({ someKey: 'I am parsed JSON!' });
              })
              .then(done, done.fail);
          });
        });

        describe('when the auxiliary return does not decode to null', function() {
          beforeEach(function() {
            spyOn(base64, 'base64Decode').and.returnValue(JSON.stringify({
              Foo: 'bar',
              Label: 'LABEL',
            }));
          });

          it('should return the auxiliary return and value', function(done) {
            request('SOME_PATH')
              .then(response => {
                expect(base64.base64Decode).toHaveBeenCalledWith('AUXILIARY_RETURN');
                expect(this.headers.has).toHaveBeenCalledWith('flux-auxiliary-return');
                expect(this.headers.get).toHaveBeenCalledWith('flux-auxiliary-return');
                expect(response).toEqual({
                  Foo: 'bar',
                  Label: 'LABEL',
                  value: { someKey: 'I am parsed JSON!' },
                });
              })
              .then(done, done.fail);
          });
        });
      });
    });
  });

  describe('#authenticatedRequest', function() {
    beforeEach(function() {
      const jsonSpy = jasmine.createSpy('json')
        .and.returnValue(Promise.resolve({ parsed: 'response' }));
      spyOn(fetchPort, 'fetch').and.returnValue(Promise.resolve({
        json: jsonSpy,
        headers: jasmine.createSpyObj('headers', ['has']),
      }));

      this.credentials = credentialsFactory({
        tokenType: 'TOKEN_TYPE',
        accessToken: 'ACCESS_TOKEN',
        fluxToken: 'FLUX_TOKEN',
      });
    });

    it('should make a request with headers from the credentials', function() {
      authenticatedRequest(this.credentials, 'AUTHENTICATED_PATH');

      expect(url.joinUrl).toHaveBeenCalledWith(['https://flux.io/', 'AUTHENTICATED_PATH']);
      expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', {
        credentials: 'include',
        headers: {
          Authorization: 'TOKEN_TYPE ACCESS_TOKEN',
          Cookie: 'auth=ACCESS_TOKEN; flux_token=FLUX_TOKEN',
          'User-Agent': `js-sdk/${version}`,
          'Flux-Request-Token': 'FLUX_TOKEN',
          'Flux-Request-Marker': 1,
          'Flux-Plugin-Platform': `browser/js-sdk/${version}`,
          'Flux-Plugin-Host': this.credentials.clientId,
        },
      });
    });

    describe('when fluxOptions is specified', function() {
      beforeEach(function() {
        spyOn(base64, 'base64Encode').and.returnValue('B64_ENCODED');
      });

      describe('when no specific options are added', function() {
        it('should add the encoded Flux-Options header with ClientInfo', function() {
          authenticatedRequest(this.credentials, 'SOME_PATH', {
            fluxOptions: true,
            headers: { another: 'header' },
          });

          expect(base64.base64Encode).toHaveBeenCalledWith(JSON.stringify({
            ClientInfo: this.credentials.clientInfo,
          }));

          expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', {
            credentials: 'include',
            headers: {
              Authorization: 'TOKEN_TYPE ACCESS_TOKEN',
              Cookie: 'auth=ACCESS_TOKEN; flux_token=FLUX_TOKEN',
              'User-Agent': `js-sdk/${version}`,
              'Flux-Request-Token': 'FLUX_TOKEN',
              'Flux-Request-Marker': 1,
              'Flux-Options': 'B64_ENCODED',
              'Flux-Plugin-Platform': `browser/js-sdk/${version}`,
              'Flux-Plugin-Host': this.credentials.clientId,
              another: 'header',
            },
          });
        });
      });

      describe('when specific options are added', function() {
        it('should add the encoded Flux-Options header', function() {
          authenticatedRequest(this.credentials, 'SOME_PATH', {
            fluxOptions: { foo: 'bar' },
            headers: { another: 'header' },
          });

          expect(base64.base64Encode).toHaveBeenCalledWith(JSON.stringify({
            ClientInfo: this.credentials.clientInfo,
            foo: 'bar',
          }));

          expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', {
            credentials: 'include',
            headers: {
              Authorization: 'TOKEN_TYPE ACCESS_TOKEN',
              Cookie: 'auth=ACCESS_TOKEN; flux_token=FLUX_TOKEN',
              'User-Agent': `js-sdk/${version}`,
              'Flux-Request-Token': 'FLUX_TOKEN',
              'Flux-Request-Marker': 1,
              'Flux-Options': 'B64_ENCODED',
              'Flux-Plugin-Platform': `browser/js-sdk/${version}`,
              'Flux-Plugin-Host': this.credentials.clientId,
              another: 'header',
            },
          });
        });
      });
    });

    it('should be able to add headers and other options', function() {
      authenticatedRequest(this.credentials, 'AUTHENTICATED_PATH', {
        headers: { HeaderKey: 'I am a header!' },
        foo: 'bar',
      });

      expect(url.joinUrl).toHaveBeenCalledWith(['https://flux.io/', 'AUTHENTICATED_PATH']);
      expect(fetchPort.fetch).toHaveBeenCalledWith('JOINED_URL', {
        credentials: 'include',
        headers: {
          HeaderKey: 'I am a header!',
          Authorization: 'TOKEN_TYPE ACCESS_TOKEN',
          Cookie: 'auth=ACCESS_TOKEN; flux_token=FLUX_TOKEN',
          'User-Agent': `js-sdk/${version}`,
          'Flux-Request-Token': 'FLUX_TOKEN',
          'Flux-Request-Marker': 1,
          'Flux-Plugin-Platform': `browser/js-sdk/${version}`,
          'Flux-Plugin-Host': this.credentials.clientId,
        },
        foo: 'bar',
      });
    });

    it('should resolve to the parsed response', function(done) {
      authenticatedRequest(this.credentials, 'AUTHENTICATED_PATH')
        .then(response => {
          expect(response).toEqual({ parsed: 'response' });
        })
        .then(done, done.fail);
    });
  });
});
