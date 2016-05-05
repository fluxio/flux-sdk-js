import { checkProject } from '../utils/schema-validators';
import { authenticatedRequest } from '../utils/request';
import DataTable from './data-table';
import {
  PROJECTS_PATH,
  projectPath,
  projectMetaPath,
} from '../constants/paths';
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

  function update(options) {
    return authenticatedRequest(credentials, metaPath, {
      method: 'put',
      query: options,
    })
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

  this.fetch = fetch;
  this.update = update;
  this.delete = deleteProject;
  this.getDataTable = getDataTable;
  this.openWebSocket = openWebSocket;
  this.closeWebSocket = closeWebSocket;
}

Project.listProjects = listProjects;
Project.createProject = createProject;
Project.serialize = serialize;
Project.serializeList = serializeList;

export default Project;
