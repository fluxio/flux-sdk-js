function serialize(entity) {
  return {
    id: entity.id,
    name: entity.name,
    creatorId: entity.creator_id,
    creatorName: entity.creator,
    timeCreated: new Date(entity.created_at),
    timeUpdated: new Date(entity.last_updated),
    acl: entity.acl,
    kind: entity.kind,
  };
}

function serializeList(entities) {
  return { entities: entities.map(serialize) };
}

export {
  serialize,
  serializeList,
};
