var nightmare = require('nightmare');

var setCookies = require('../support/test-state').setCookies;

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
    var baseUrl = 'http://localhost:' + this.PORT;
    var self = this;
    console.log('baseUrl', baseUrl)

    this.app.listen(this.PORT, function() {
      self.nightmare.goto(baseUrl + '/auth_callback')
        .wait('#emailInput')
        .type('#emailInput', self.EMAIL)
        .type('#passwordInput', self.PASSWORD)
        .click('#handleLogin')
        .wait('#authorizeApp')
        .click('#authorizeApp paper-button')
        .wait(function(origin) {
          return window.location.origin === origin;
        }, baseUrl)
        .cookies.get('connect.sid')
        .then(function(cookies) {
          setCookies('connect.sid=' + cookies.value);
          done();
        });
    });
  });

  afterEach(function(done) {
    this.nightmare.end(done);
  });
});
