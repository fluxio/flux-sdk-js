import { checkTopic } from '../../utils/schema-validators';

function serialize(topic) {
  checkTopic(topic);
  return topic;
}

function serializeList(topics) {
  return topics.map(serialize);
}

export {
  serialize,
  serializeList,
};
