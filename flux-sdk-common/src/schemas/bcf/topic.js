export default {
  required: true,
  title: 'Topic',
  type: 'object',
  properties: {
    guid: {
      type: 'string',
    },
    creationDate: {
      type: 'string',
      format: 'date-time',
    },
    creationAuthor: {
      type: 'string',
    },
    modifiedDate: {
      type: 'string',
      format: 'date-time',
    },
    modifiedAuthor: {
      type: 'string',
    },
    topicType: {
      title: 'TopicType',
      type: 'string',
      enum: [
        'ISSUE',
        'REQUEST',
        'COMMENT',
        'SOLUTION',
      ],
    },
    topicStatus: {
      title: 'TopicStatus',
      type: 'string',
      enum: [
        'OPEN',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
      ],
    },
    priority: {
      title: 'BCFPriority',
      type: 'string',
      enum: [
        'TRIAGE',
        'MINOR',
        'MAJOR',
        'CRITICAL',
      ],
    },
    dueDate: {
      type: ['string', null],
      format: 'date-time',
    },
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    assignedTo: {
      type: 'string',
    },
    labels: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    bimSnippet: {
      title: 'BIMSnippet',
      type: ['object', 'null'],
      properties: {
        reference: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
    fluxProperties: {
      type: 'object',
    },
  },
};
