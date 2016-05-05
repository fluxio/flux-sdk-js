import { random as fakerRandom } from 'faker';

function credentialsFactory(overrides = {}) {
  const clientId = overrides.clientId || fakerRandom.uuid();
  return {
    clientId,
    accessToken: fakerRandom.uuid().slice(-17),
    fluxToken: fakerRandom.uuid().slice(-17),
    tokenType: 'bearer',
    clientInfo: {
      ClientId: clientId,
    },
    ...overrides,
  };
}

export default credentialsFactory;
