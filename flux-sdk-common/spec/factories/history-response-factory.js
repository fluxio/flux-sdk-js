function historyQueryFactory(limit, page) {
  const Limit = limit ? { Limit: limit } : null;
  const Cursor = page ? { Cursor: page.toString() } : null;
  return {
    ...Limit,
    ...Cursor,
  };
}

function historyResponseFactory(options = {}) {
  const { limit, page } = options;
  const historyQuery = historyQueryFactory(limit, page);
  return {
    historyQuery,
    closeErr: null,
    historyEvent: [{
      cellEvent: {
        Event: {
          Type: 'CELL_MODIFIED',
          ClientInfo: {
            DeveloperId: '',
            DeveloperName: '',
            ClientId: 'CLIENT_ID',
            ClientName: 'CLIENT NAME',
            ClientVersion: '',
            AdditionalClientData: {
              HostProgramMainFile: '',
              HostProgramVersion: '',
            },
            SDKName: '',
            SDKVersion: '',
            OS: '',
            UserId: 'USER_ID',
            UserName: 'USERNAME',
          },
          CellId: 'CELL_ID',
          ValueRef: '/SOME_VALUE_REF_PATH/',
          Time: 5000,
          Size: 400,
        },
      },
      error: null,
    }],
  };
}

export default historyResponseFactory;
