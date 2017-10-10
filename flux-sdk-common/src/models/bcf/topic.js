import { authenticatedRequest } from '../../utils/request';
import copyFields from '../../utils/copy-fields';
import Comment from './comment';
import Viewpoint from './viewpoint';
import {
  bcfTopicsPath,
  bcfTopicPath,
} from '../../constants/paths';
import { checkTopic } from '../../utils/schema-validators';
import {
  serialize,
  serializeList,
} from '../../serializers/bcf/topic';


function hydrate(credentials, projectId, topic) {
  const t = new Topic(credentials, projectId, topic.guid);
  copyFields(t, topic);
  return t;
}

function updateTopic(credentials, projectId, topicId, newTopic) {
  checkTopic(newTopic);
  return authenticatedRequest(credentials, bcfTopicPath(projectId, topicId), {
    body: newTopic,
    method: 'put',
  })
  .then(Topic.serialize)
  .then((topic) => hydrate(credentials, projectId, topic));
}

function getTopics(credentials, projectId) {
  return authenticatedRequest(credentials, bcfTopicsPath(projectId))
  .then(Topic.serializeList)
  .then((topics) => topics.map((t) => hydrate(credentials, projectId, t)));
}

function createTopic(credentials, projectId, newTopic) {
  return createTopics(credentials, projectId, [newTopic])
  .then((topics) => topics[0]);
}

function createTopics(credentials, projectId, newTopics) {
  for (let i = 0, len = newTopics.length; i < len; i++) {
    checkTopic(newTopics[i]);
  }
  return authenticatedRequest(credentials, bcfTopicsPath(projectId), {
    body: newTopics,
    method: 'post',
  })
  .then(Topic.serializeList)
  .then((topics) => topics.map((t) => hydrate(credentials, projectId, t)));
}

function Topic(credentials, projectId, id) {
  const path = bcfTopicPath(projectId, id);

  function fetch() {
    const self = this;
    return authenticatedRequest(credentials, path)
    .then(Topic.serialize)
    .then((topic) => copyFields(self, topic));
  }

  function update(newTopic) {
    return updateTopic(credentials, projectId, id, newTopic);
  }

  function getViewpoints() {
    return Viewpoint.listViewpoints(credentials, projectId, id);
  }

  function createViewpoint(newViewpoint) {
    return Viewpoint.createViewpoint(credentials, projectId, id, newViewpoint);
  }

  function getComments() {
    return Comment.listComments(credentials, projectId, id);
  }

  function createComment(newComment) {
    return Comment.createComment(credentials, projectId, id, newComment);
  }

  this.fetch = fetch;
  this.update = update;
  this.getViewpoints = getViewpoints;
  this.createViewpoint = createViewpoint;
  this.getComments = getComments;
  this.createComment = createComment;
}

Topic.getTopics = getTopics;
Topic.createTopics = createTopics;
Topic.createTopic = createTopic;
Topic.serialize = serialize;
Topic.serializeList = serializeList;

export default Topic;
