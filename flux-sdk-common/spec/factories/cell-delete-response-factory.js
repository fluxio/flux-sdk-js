function cellDeleteFactory(id, overrides) {
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
        CellId: '',
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
            HostProgramMainFile: 'web',
            HostProgramVersion: 'unknown',
          },
          SDKName: '',
          SDKVersion: '',
          OS: '',
          UserId: `USER_ID_${id}`,
          UserName: `USERNAME_${id}`,
        },
        CellId: '',
        Time: id * 1000 + 5,
        Size: 0,
      },
    },
    ClientMetadata: {
      Description: '',
      Inactive: 'true',
      Label: '#INACTIVE:20160412204410.635180795 newcell',
      Locked: false,
    },
    ...overrides,
  };
}

export default cellDeleteFactory;
