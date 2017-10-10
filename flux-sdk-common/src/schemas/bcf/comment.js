export default {
  required: true,
  title: 'Comment',
  type: 'object',
  properties: {
    guid: {
      type: 'string',
    },
    topicGuid: {
      type: 'string',
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
    author: {
      type: 'string',
    },
    modifiedDate: {
      type: 'string',
      format: 'date-time',
    },
    modifiedAuthor: {
      type: 'string',
    },
    comment: {
      type: 'string',
    },
    viewpointGuid: {
      type: 'string',
    },
    replyToCommentGuid: {
      type: 'string',
    },
    fluxProperties: {
      type: 'object',
    },
  },
};
