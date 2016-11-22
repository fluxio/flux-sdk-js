import { checkProject } from '../utils/schema-validators';
import { authenticatedRequest } from '../utils/request';
import DataTable from './data-table';
import User from './user';
import {
  PROJECTS_PATH,
  projectPath,
  projectMetaPath,
  projectUsersPath,
  modifyUserPath,
} from '../constants/paths';
import {
    VIEWER,
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
  const metaPath = projectMetaPath(id);
  let dataTable = null;

  function fetch() {
    return authenticatedRequest(credentials, metaPath)
      .then(Project.serialize);
  }

  function deleteProject() {
    return authenticatedRequest(credentials, path, { method: 'delete' });
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
    const validPerm = permission === undefined ? VIEWER : validate(permission);
    return authenticatedRequest(credentials, projectUsersPath(id), {
      method: 'post',
      form: {
        email,
        permission: validPerm,
      },
    });
  }

  function unshare(email) {
    return share(email, 'none');
  }

  function unshareById(userId) {
    return authenticatedRequest(credentials, modifyUserPath(id, userId), {
      method: 'delete',
    });
  }

  function changePermissionById(userId, permission) {
    const validPerm = permission === undefined ? VIEWER : validate(permission);
    return authenticatedRequest(credentials, modifyUserPath(id, userId), {
      method: 'post',
      form: {
        permission: validPerm,
      },
    });
  }

  this.fetch = fetch;
  this.delete = deleteProject;
  this.getDataTable = getDataTable;
  this.openWebSocket = openWebSocket;
  this.closeWebSocket = closeWebSocket;
  this.listUsers = listUsers;
  this.share = share;
  this.unshare = unshare;
  this.unshareById = unshareById;
  this.changePermissionById = changePermissionById;
}

Project.listProjects = listProjects;
Project.createProject = createProject;
Project.serialize = serialize;
Project.serializeList = serializeList;

export default Project;
