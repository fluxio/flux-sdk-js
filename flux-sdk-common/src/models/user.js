import Project from './project';
import DataTable from './data-table';
import Cell from './cell';
import { checkUser } from '../utils/schema-validators';
import deprecated from '../utils/deprecated';
import { authenticatedRequest } from '../utils/request';
import { PROFILE_PATH, projectUsersPath } from '../constants/paths';
import serializeProfile from '../serializers/profile-serializer';
import serializeList from '../serializers/user-serializer';

function isLoggedIn(credentials = {}) {
  let response = null;
  try {
    response = new User(credentials)
      .fetchProfile()
      .then(() => true)
      .catch(() => false);
  } catch (e) {
    response = Promise.resolve(false);
  }
  return response;
}

function listUsers(credentials, projectId) {
  return authenticatedRequest(credentials, projectUsersPath(projectId))
    .then(User.serializeList);
}

function User(credentials = {}) {
  checkUser({ credentials });

  const self = this;

  function fetchProfile() {
    return authenticatedRequest(credentials, PROFILE_PATH)
      .then(User.serializeProfile);
  }

  function getProject(projectId) {
    return new Project(credentials, projectId);
  }

  function getDataTable(dataTableId) {
    return new DataTable(credentials, dataTableId);
  }

  function getCell(dataTableId, cellId) {
    return new Cell(credentials, dataTableId, cellId);
  }

  function listProjects() {
    return Project.listProjects(credentials);
  }

  function createProject(name, options) {
    return Project.createProject(credentials, name, options);
  }

  function getWhoami() {
    deprecated('User.getWhoami', 'User.fetchProfile');
    return self.fetchProfile();
  }

  function setWhoami() {
    deprecated(); // TODO
  }

  this.fetchProfile = fetchProfile;
  this.getProject = getProject;
  this.getDataTable = getDataTable;
  this.getCell = getCell;
  this.listProjects = listProjects;
  this.createProject = createProject;
  this.setWhoami = setWhoami;
  this.getWhoami = getWhoami;
}

User.isLoggedIn = isLoggedIn;
User.serializeProfile = serializeProfile;
User.serializeList = serializeList;
User.listUsers = listUsers;

export default User;
