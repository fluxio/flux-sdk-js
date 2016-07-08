function serializeEvent(event) {
  const clientInfo = event.ClientInfo || {};
  return {
    cellId: event.CellId,
    eventType: event.Type,
    time: event.Time,
    size: event.Size,
    valueHref: event.ValueRef,
    clientId: clientInfo.ClientId,
    clientName: clientInfo.ClientName,
    authorId: clientInfo.UserId,
    authorName: clientInfo.UserName,
  };
}

function serialize({ historyEvents, historyQuery }) {
  const query = historyQuery || {};

  return {
    entities: (historyEvents || []).map(event => serializeEvent(event.Event)),
    cursor: query.Cursor || null,
    limit: query.Limit || 0,
  };
}

export default serialize;
