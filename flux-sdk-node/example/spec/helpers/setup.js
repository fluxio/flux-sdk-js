var request = require('supertest');

var app = require('../../app');
var testState = require('../support/test-state');

function randomString() {
  return Math.random().toString().substring(10);
}

beforeAll(function() {
  this.PORT = process.env.EXAMPLE_PORT || app.get('port');
  this.EMAIL = process.env.TEST_EMAIL || process.env.USER + '+nodetest@flux.io';
  this.PASSWORD = process.env.TEST_PASSWORD || 'nodetest123';
  this.FLUX_URL = process.env.FLUX_URL;
  this.CLIENT_ID = process.env.CLIENT_ID;
  this.CLIENT_SECRET = process.env.CLIENT_SECRET;
  this.ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
  this.FLUX_TOKEN = process.env.FLUX_TOKEN || '';

  this.randomString = randomString;
  this.app = app;

  this.request = function(path, method) {
    var req = request(app)[method || 'get'](path);
    req.cookies = testState.getCookies();
    return req;
  };

  this.endRequest = function(done) {
    return function(err) {
      if (err) {
        done.fail(err);
      } else {
        done();
      }
    };
  };
});

afterAll(function(done) {
  this.request(`/api/projects/${testState.getProjectId()}`, 'delete')
    .expect(202)
    .end(function(err) {
      if (err) { throw err; }
      done();
    });
});
