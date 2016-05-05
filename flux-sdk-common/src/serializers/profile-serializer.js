function serialize(entity) {
  return {
    id: entity.id,
    email: entity.email,
    makerId: entity.makerid,
    displayName: entity.display_name,
    firstName: entity.first_name,
    lastName: entity.last_name,
    kind: entity.kind,
  };
}

export default serialize;
