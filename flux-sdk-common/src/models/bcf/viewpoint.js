import { authenticatedRequest } from '../../utils/request';
import copyFields from '../../utils/copy-fields';
import {
  bcfViewpointsPath,
  bcfViewpointPath,
  bcfSnapshotPath,
  FLUX_URL,
} from '../../constants/paths';
import { checkViewpoint } from '../../utils/schema-validators';
import {
  serialize,
  serializeList,
} from '../../serializers/bcf/viewpoint';

const snapshotMimeTypes = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
};

function hydrate(credentials, projectId, topicId, viewpoint) {
  const v = new Viewpoint(credentials, projectId, topicId, viewpoint.guid);
  copyFields(v, viewpoint);
  return v;
}

function listViewpoints(credentials, projectId, topicId) {
  return authenticatedRequest(credentials, bcfViewpointsPath(projectId, topicId))
  .then(Viewpoint.serializeList)
  .then((viewpoints) => viewpoints.map((v) => hydrate(credentials, projectId, topicId, v)));
}

function createViewpoint(credentials, projectId, topicId, newViewpoint) {
  checkViewpoint(newViewpoint);
  return authenticatedRequest(credentials, bcfViewpointsPath(projectId, topicId), {
    body: newViewpoint,
    method: 'post',
  })
  .then(Viewpoint.serialize)
  .then((viewpoint) => hydrate(credentials, projectId, topicId, viewpoint));
}

function _createSnapshot(credentials, projectId, topicId, viewpointId, snapshot) {
  const contentType = snapshotMimeTypes[snapshot.snapshotType];
  if (!contentType) {
    throw new Error(`${contentType} is not a valid snapshot type. It must be one of ${Object.keys(snapshotMimeTypes)}`);
  }
  // TODO(alcorn) BCF snapshot validator
  return authenticatedRequest(credentials, bcfSnapshotPath(projectId, topicId, viewpointId), {
    body: snapshot.snapshotData,
    headers: {
      "Content-Type": contentType,
    },
    method: 'post',
  });
  // TODO(alcorn) BCF snapshot serializer
}

function _getSnapshot(credentials, projectId, topicId, viewpointId) {
  return authenticatedRequest(credentials, bcfSnapshotPath(projectId, topicId, viewpointId));
  // TODO(alcorn) BCF snapshot serializer
}

function Viewpoint(credentials, projectId, topicId, viewpointId) {
  const path = bcfViewpointPath(projectId, topicId, viewpointId);

  function fetch() {
    const self = this;
    return authenticatedRequest(credentials, path)
    .then(Viewpoint.serialize)
    .then((viewpoint) => copyFields(self, viewpoint));
  }

  function createSnapshot(snapshot) {
    return _createSnapshot(credentials, projectId, topicId, viewpointId, snapshot);
  }

  function getSnapshot() {
    return _getSnapshot(credentials, projectId, topicId, viewpointId);
  }

  function getSnapshotURL() {
    return FLUX_URL + bcfSnapshotPath(projectId, topicId, viewpointId);
  }

  this.fetch = fetch;
  this.replaceSnapshot = createSnapshot;
  this.getSnapshot = getSnapshot;
  this.getSnapshotURL = getSnapshotURL;
}

Viewpoint.listViewpoints = listViewpoints;
Viewpoint.createViewpoint = createViewpoint;
Viewpoint.serialize = serialize;
Viewpoint.serializeList = serializeList;

export default Viewpoint;
