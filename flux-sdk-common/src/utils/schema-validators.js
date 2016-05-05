import validator from 'is-my-json-valid';

import { DEBUG } from '../config';

const verbose = DEBUG;
const greedy = DEBUG;

function validate(type, schemaValidator, data) {
  const valid = schemaValidator(data);
  if (!valid) {
    const baseMessage = `Invalid ${type} object`;
    if (DEBUG) {
      throw new Error(`${baseMessage}: ${JSON.stringify(schemaValidator.errors)}`);
    } else {
      throw new Error(baseMessage);
    }
  }
}

const credentialsSchema = {
  required: true,
  type: 'object',
  properties: {
    clientId: { type: 'string', required: true },
    accessToken: { type: 'string', required: true },
    fluxToken: { type: 'string', required: true },
    tokenType: { type: 'string', required: true },
    refreshToken: { type: 'string' },
    scope: { type: 'string' },
    tokenExpiry: { type: 'number' },
    clientInfo: {
      type: 'object',
      required: true,
      properties: {
        // TODO
        ClientId: { type: 'string', required: true },
      },
    },
    idToken: { type: 'object' },
  },
};
const credentialsValidator = validator(credentialsSchema, { verbose, greedy });

const userSchema = {
  required: true,
  type: 'object',
  properties: {
    credentials: { $ref: '#credentials' },
  },
};
const validateUser = validator(userSchema, {
  verbose,
  greedy,
  schemas: { credentials: credentialsSchema },
});

const projectSchema = {
  required: true,
  type: 'object',
  properties: {
    id: { type: 'string', required: true },
    credentials: { $ref: '#credentials' },
  },
};
const validateProject = validator(projectSchema, {
  verbose,
  greedy,
  schemas: { credentials: credentialsSchema },
});

function checkSdk() {

}

function checkCredentials(credentials) {
  validate('credentials', credentialsValidator, credentials);
}

function checkUser(user) {
  validate('User', validateUser, user);
}

function checkProject(project) {
  validate('project', validateProject, project);
}

function checkDataTable() {
}

function checkCell() {

}

export {
  checkSdk,
  checkCredentials,
  checkUser,
  checkProject,
  checkDataTable,
  checkCell,
};
