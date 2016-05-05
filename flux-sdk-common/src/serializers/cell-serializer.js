function serialize(entity) {
  const clientMetadata = Object(entity.ClientMetadata);
  const metadata = Object(entity.Metadata);
  const lastModification = metadata.Modify || metadata.Create || {};
  const clientInfo = Object(lastModification.ClientInfo);
  const valueKey = entity.value !== undefined ? { value: entity.value } : null;

  return {
    id: entity.CellId,
    label: clientMetadata.Label,
    description: clientMetadata.Description,
    size: lastModification.Size,
    timeUpdated: new Date(lastModification.Time),
    locked: !!clientMetadata.Locked,
    authorId: clientInfo.UserId,
    authorName: clientInfo.UserName,
    clientId: clientInfo.ClientId,
    clientName: clientInfo.ClientName,
    ...valueKey,
  };
}

function serializeDelete(entity) {
  return {
    id: entity.CellId,
  };
}

function serializeList(entities) {
  return {
    entities: entities.map(serialize),
  };
}

export {
  serialize,
  serializeDelete,
  serializeList,
};
