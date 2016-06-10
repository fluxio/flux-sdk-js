import FluxSdk from '../../src/index';

import credentialsFactory from '../../../flux-sdk-common/spec/factories/credentials-factory';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

beforeAll(function() {
  const accessToken = process.env.ACCESS_TOKEN;
  const fluxToken = process.env.FLUX_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const fluxUrl = process.env.FLUX_URL;

  this.CLIENT_ID = clientId;

  this.sdk = new FluxSdk(clientId, {
    clientSecret,
    fluxUrl,
  });

  this.credentials = credentialsFactory({
    clientId,
    accessToken,
    fluxToken,
  });
  this.user = this.sdk.getUser(this.credentials);

  // We want to be able to both inspect the original server response
  // and see the (default) serialized version for endpoints.
  const serializers = [
    { module: this.sdk.User, methods: ['serializeProfile'] },
    { module: this.sdk.Project, methods: ['serialize', 'serializeList'] },
    { module: this.sdk.DataTable, methods: ['serializeHistory'] },
    { module: this.sdk.Cell, methods: ['serialize', 'serializeList'] },
  ];

  serializers.forEach(({ module, methods }) => {
    methods.forEach(method => {
      const originalMethod = module[method];
      const modifiedModule = module;

      modifiedModule[method] = res => ({
        original: res,
        transformed: originalMethod(res),
      });
    });
  });
});

beforeAll(function(done) {
  this.user.fetchProfile()
    .then(({ transformed }) => {
      this.userProfile = transformed;

      this.userFullName = `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    })
    .then(done, done.fail);
});
