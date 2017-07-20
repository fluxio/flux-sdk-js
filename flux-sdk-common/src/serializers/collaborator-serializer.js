function serialize(entity) {
  return {
    userId: entity.id,
    displayName: entity.display,
  };
}

function serializeList(entities) {
  return entities.map(serialize);
}

function serializeObject(projects) {
  const projectIds = Object.keys(projects);
  const entities = [];
  for (let i = 0; i < projectIds.length; i++) {
    const project = { projectId: projectIds[i] };
    project.users = serializeList(projects[projectIds[i]]);
    entities.push(project);
  }
  return { entities };
}

export {
  serializeObject,
};
