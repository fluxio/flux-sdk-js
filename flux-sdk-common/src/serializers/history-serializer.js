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

function serialize({ historyEvent, historyQuery }) {
  const query = historyQuery || {};
  return {
    entities: historyEvent.map(event => serializeEvent(event.cellEvent.Event)),
    page: Number(query.Cursor || 0),
    limit: query.Limit || 0,
  };
}

export default serialize;
