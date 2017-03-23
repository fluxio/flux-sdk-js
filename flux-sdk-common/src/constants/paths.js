export const FLUX_URL = 'https://flux.io/';

// TODO(daishi): Migrate to using joinUrl style without trailing /.
export const PROFILE_PATH = 'api/whoami/';
export const AUTHORIZE_PATH = 'authorize/';
export const ACCESS_TOKEN_PATH = 'api/token/';

export const PROJECTS_PATH = 'api/projects/';
export const projectPath = id => `p/${id}/`;
export const projectMetaPath = id => `${projectPath(id)}api/meta/`;
export const projectUsersPath = id => `api/v1/projects/${id}/users/`;
export const projectTessellatePath = id =>
    `p/${id}/api/blockexec?block=flux-internal/parasolid/Parasolid`;
export const removeUserPath = (id, userId) => `${projectUsersPath(id)}${userId}`;
export const execFlowPath = id => `p/${id}/api/flowexec`;

const dataTablePath = id => `${projectPath(id)}api/datatable/v1/`;
export const dataTableCapabilityPath = id => `${dataTablePath(id)}capability/`;
export const dataTableWebSocketPath = id => `${projectPath(id)}wsurl`;
export const dataTableHistoryPath = id => `${dataTablePath(id)}history/`;

export const cellsPath = dataTableId => `${dataTablePath(dataTableId)}cells/`;
export const cellPath = (dataTableId, id) => (
  `${cellsPath(dataTableId)}${id ? `${id}/` : ''}`
);
export const publishCellPath = (projectId, cellId) =>
`api/v1/projects/${projectId}/sharedata/${cellId}/`;
