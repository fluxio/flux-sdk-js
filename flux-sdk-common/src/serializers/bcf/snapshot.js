function serialize(snapshot) {
  // Snapshot is already a base64 string promise, see request.js handleImage
  return snapshot;
}

function serializeList(viewpoints) {
  return viewpoints.map(serialize);
}

export {
  serialize,
  serializeList,
};
