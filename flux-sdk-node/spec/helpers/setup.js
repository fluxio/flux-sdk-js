import request from 'supertest';

import app from '../../example/app';
import {
  getCookies,
  getProjectId,
} from '../support/test-state';

function randomString() {
  return Math.random().toString().substring(10);
}

beforeAll(function() {
  this.PORT = process.env.EXAMPLE_PORT || app.get('port');
  this.EMAIL = process.env.TEST_EMAIL || `${process.env.USER}+nodetest@flux.io`;
  this.PASSWORD = process.env.TEST_PASSWORD || 'nodetest123';
  this.FLUX_URL = process.env.FLUX_URL;
  this.CLIENT_ID = process.env.CLIENT_ID;
  this.CLIENT_SECRET = process.env.CLIENT_SECRET;

  this.randomString = randomString;
  this.app = app;

  this.request = (path, method) => {
    const req = request(app)[method || 'get'](path);
    req.cookies = getCookies();
    return req;
  };

  this.endRequest = done => err => {
    if (err) {
      done.fail(err);
    } else {
      done();
    }
  };
});

afterAll(function(done) {
  this.request(`/api/projects/${getProjectId()}`, 'delete')
    .expect(202)
    .end(err => {
      if (err) { throw err; }
      done();
    });
});
