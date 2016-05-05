function cellFactory(id, overrides) {
  return {
    CellId: id,
    Metadata: {
      Create: {
        Type: 'CELL_CREATED',
        ClientInfo: {
          DeveloperId: '',
          DeveloperName: '',
          ClientId: '',
          ClientName: '',
          ClientVersion: '',
          AdditionalClientData: null,
          SDKName: '',
          SDKVersion: '',
          OS: '',
          UserId: '',
          UserName: '',
        },
        Time: id * 1000,
        Size: 0,
      },
      Modify: {
        Type: 'CELL_MODIFIED',
        ClientInfo: {
          DeveloperId: '',
          DeveloperName: '',
          ClientId: `CLIENT_ID_${id}`,
          ClientName: `CLIENT NAME ${id}`,
          ClientVersion: '',
          AdditionalClientData: {
            HostProgramMainFile: '',
            HostProgramVersion: '',
          },
          SDKName: '',
          SDKVersion: '',
          OS: '',
          UserId: `USER_ID_${id}`,
          UserName: `USERNAME_${id}`,
        },
        Time: id * 1000 + 5,
        Size: 50,
      },
    },
    ClientMetadata: {
      Description: `DESCRIPTION ${id}`,
      Label: `LABEL ${id}`,
    },
    ...overrides,
  };
}

export default cellFactory;
