import { authenticatedRequest } from '../../utils/request';
import copyFields from '../../utils/copy-fields';
import {
  bcfCommentsPath,
  bcfCommentPath,
} from '../../constants/paths';
import { checkComment } from '../../utils/schema-validators';
import {
  serialize,
  serializeList,
} from '../../serializers/bcf/comment';


function hydrate(credentials, projectId, topicId, comment) {
  const c = new Comment(credentials, projectId, topicId, comment.guid);
  copyFields(c, comment);
  return c;
}

function updateComment(credentials, projectId, topicId, commentId, newComment) {
  checkComment(newComment);
  return authenticatedRequest(credentials, bcfCommentPath(projectId, topicId, commentId), {
    body: newComment,
    method: 'put',
  })
  .then(Comment.serialize)
  .then((comment) => hydrate(credentials, projectId, topicId, comment));
}

function listComments(credentials, projectId, topicId) {
  return authenticatedRequest(credentials, bcfCommentsPath(projectId, topicId))
  .then(Comment.serializeList)
  .then((comments) => comments.map((c) => hydrate(credentials, projectId, topicId, c)));
}

function createComment(credentials, projectId, topicId, newComment) {
  checkComment(newComment);
  return authenticatedRequest(credentials, bcfCommentsPath(projectId, topicId), {
    body: newComment,
    method: 'post',
  })
  .then(Comment.serializeList)
  .then((comment) => hydrate(credentials, projectId, topicId, comment));
}

function Comment(credentials, projectId, topicId, commentId) {
  const path = bcfCommentPath(projectId, topicId, commentId);

  function fetch() {
    const self = this;
    return authenticatedRequest(credentials, path)
    .then(Comment.serialize)
    .then((comment) => copyFields(self, comment));
  }

  function update(newComment) {
    return updateComment(credentials, projectId, topicId, commentId, newComment);
  }

  this.fetch = fetch;
  this.update = update;
}

Comment.listComments = listComments;
Comment.createComment = createComment;
Comment.serialize = serialize;
Comment.serializeList = serializeList;

export default Comment;
