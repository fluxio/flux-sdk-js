function serialize(entity) {
  return {
    id: entity.id,
    displayName: entity.display,
    permission: entity.permission,
  };
}

function serializeList(entities) {
  return { entities: entities.map(serialize) };
}

export {
  serialize,
  serializeList,
};
