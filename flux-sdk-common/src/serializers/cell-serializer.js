function serialize(entity) {
  const clientMetadata = Object(entity.ClientMetadata);
  const metadata = Object(entity.Metadata);
  const lastModification = metadata.Modify || metadata.Create || {};
  const clientInfo = Object(lastModification.ClientInfo);
  const valueKey = entity.value !== undefined ? { value: entity.value } : null;
  const additionalClientData = Object(clientInfo.AdditionalClientData);

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
    fileName: additionalClientData.HostProgramMainFile,
    ...valueKey,
  };
}

function serializeDelete(entity) {
  const metadata = Object(entity.Metadata);
  const lastModification = metadata.Modify || metadata.Create || {};
  const clientInfo = Object(lastModification.ClientInfo);
  const additionalClientData = Object(clientInfo.AdditionalClientData);

  return {
    id: entity.CellId,
    authorId: clientInfo.UserId,
    authorName: clientInfo.UserName,
    clientId: clientInfo.ClientId,
    clientName: clientInfo.ClientName,
    fileName: additionalClientData.HostProgramMainFile,
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
