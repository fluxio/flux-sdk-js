var cookies = null;
var projectId = null;
var cellId = null;

function getCookies() { return cookies; }

function setCookies(newCookies) { cookies = newCookies; }

function getProjectId() {
  return projectId;
}

function setProjectId(newProject) {
  projectId = newProject;
}

function getCellId() {
  return cellId;
}

function setCellId(newCell) {
  cellId = newCell;
}

module.exports = {
  getCookies,
  setCookies,
  getProjectId,
  setProjectId,
  getCellId,
  setCellId,
};
