import { checkProject } from '../utils/schema-validators';
import { authenticatedRequest } from '../utils/request';
import DataTable from './data-table';
import User from './user';
import Topic from './bcf/topic';
import {
  PROJECTS_PATH,
  projectPath,
  projectMetaPath,
  projectUsersPath,
  projectBlockExecPath,
  removeUserPath,
  execFlowPath,
} from '../constants/paths';
import {
    COLLABORATOR,
    VALID_PERMISSIONS,
} from '../constants/permissions';
import { serialize, serializeList } from '../serializers/project-serializer';

function listProjects(credentials) {
  return authenticatedRequest(credentials, PROJECTS_PATH)
    .then(Project.serializeList);
}

function createProject(credentials, name, options = {}) {
  const { app } = options;
  return authenticatedRequest(credentials, PROJECTS_PATH, {
    method: 'post',
    query: {
      name,
      app: app || 'blank',
    },
  })
    .then(Project.serialize);
}

function Project(credentials, id) {
  checkProject({ credentials, id });

  const path = projectPath(id);
  const blockPath = projectBlockExecPath(id);
  const metaPath = projectMetaPath(id);
  let dataTable = null;

  function fetch() {
    return authenticatedRequest(credentials, metaPath)
      .then(Project.serialize);
  }

  function deleteProject() {
    return authenticatedRequest(credentials, path, { method: 'delete' });
  }

  /**
   * Execute queries against geometry worker.
   * Can be used to tessellate solid and surface models to mesh.
   * NOTE: This function is used by https://terra.flux.kitchen/
   */
  function parasolid(body) {
    return authenticatedRequest(credentials, blockPath, {
      method: 'post',
      query: { block: 'flux-internal/parasolid/Parasolid' },
      body,
    });
  }

  function getDataTable() {
    dataTable = dataTable || new DataTable(credentials, id);
    return dataTable;
  }

  function openWebSocket() {
    getDataTable().openWebSocket();
  }

  function closeWebSocket() {
    getDataTable().closeWebSocket();
  }

  function listUsers() {
    return User.listUsers(credentials, id);
  }

  function validate(permission) {
    if (VALID_PERMISSIONS.indexOf(permission) < 0) {
      throw new Error([
        'Invalid permission:',
        permission,
        'Valid permissions are',
        VALID_PERMISSIONS.join(','),
      ].join(' '));
    }
    return permission;
  }

  function share(email, permission) {
    const validPerm = permission === undefined ? COLLABORATOR : validate(permission);
    return authenticatedRequest(credentials, projectUsersPath(id), {
      method: 'post',
      form: {
        email,
        permission: validPerm,
      },
    });
  }

  function unshare(userId) {
    return authenticatedRequest(credentials, removeUserPath(id, userId), {
      method: 'delete',
    });
  }

  function executeFlow(inputs, options) {
    // Currently only for Flux internal use. Project must be whitelisted by a
    // Flux engineer for this method to work.
    const computeEndpoint = (options && options.computeEndpoint) || execFlowPath(id);
    return authenticatedRequest(credentials, computeEndpoint, {
      method: 'post',
      body: {
        inputs,
      },
    }).then(resp => {
      const errors = resp.Errors;
      const outputs = resp.Outputs;
      if (errors && errors.length && errors.length > 0) {
        const error = new Error(`${errors.length} flow errors occurred.`);
        error.messages = errors;
        error.outputs = outputs;
        throw error;
      }
      return outputs;
    });
  }

  function listTopics() {
    return Topic.listTopics(credentials, id);
  }

  function createTopic(newTopic) {
    return Topic.createTopic(credentials, id, newTopic);
  }

  function createTopics(newTopics) {
    return Topic.createTopics(credentials, id, newTopics);
  }

  this.fetch = fetch;
  this.delete = deleteProject;
  this.parasolid = parasolid;
  this.getDataTable = getDataTable;
  this.openWebSocket = openWebSocket;
  this.closeWebSocket = closeWebSocket;
  this.listUsers = listUsers;
  this.share = share;
  this.unshare = unshare;
  this.executeFlow = executeFlow;
  this.listTopics = listTopics;
  this.createTopic = createTopic;
  this.createTopics = createTopics;
}

Project.listProjects = listProjects;
Project.createProject = createProject;
Project.serialize = serialize;
Project.serializeList = serializeList;

export default Project;
