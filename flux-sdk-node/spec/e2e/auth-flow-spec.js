import nightmare from 'nightmare';

import { setCookies } from '../support/test-state';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('auth flow', function() {
  beforeEach(function() {
    this.previousTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    this.nightmare = nightmare({
      show: !!process.env.DEBUG,
      switches: { 'ignore-certificate-errors': true },
      webPreferences: { partition: 'donotpersist' },
    });
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = this.previousTimeout;
  });

  it('should be able to retrieve credentials for a user', function(done) {
    const baseUrl = `http://localhost:${this.PORT}`;

    this.app.listen(this.PORT, () => {
      this.nightmare.goto(`${baseUrl}/auth_callback`)
        .wait('#emailInput')
        .type('#emailInput', this.EMAIL)
        .type('#passwordInput', this.PASSWORD)
        .click('#handleLogin')
        .wait('#authorizeApp')
        .click('#authorizeApp paper-button')
        .wait(origin => window.location.origin === origin, baseUrl)
        .cookies.get('connect.sid')
        .then(cookies => {
          setCookies(`connect.sid=${cookies.value}`);
          done();
        });
    });
  });

  afterEach(function(done) {
    this.nightmare.end(done);
  });
});
