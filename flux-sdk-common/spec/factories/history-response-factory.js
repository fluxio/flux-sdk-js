function historyQueryFactory(limit, cursor) {
  const Limit = limit ? { Limit: limit } : null;
  const Cursor = cursor ? { Cursor: cursor } : null;
  return {
    ...Limit,
    ...Cursor,
  };
}

function historyResponseFactory(options = {}) {
  const { limit, cursor, fileName, totalCount } = options;
  const historyQuery = historyQueryFactory(limit, cursor);
  return {
    historyQuery,
    historyEvents: [{
      Event: {
        Type: 'CELL_MODIFIED',
        ClientInfo: {
          DeveloperId: '',
          DeveloperName: '',
          ClientId: 'CLIENT_ID',
          ClientName: 'CLIENT NAME',
          ClientVersion: '',
          AdditionalClientData: {
            HostProgramMainFile: fileName || '',
            HostProgramVersion: '',
          },
          SDKName: '',
          SDKVersion: '',
          OS: 'BROWSER_USER_AGENT',
          UserId: 'USER_ID',
          UserName: 'USERNAME',
        },
        CellId: 'CELL_ID',
        ValueRef: '/SOME_VALUE_REF_PATH/',
        Time: 1.467241275947e+12,
        Size: 4,
      },
    }],
    totalCount,
  };
}

export default historyResponseFactory;
