function projectFactory(id, overrides = {}) {
  return {
    id,
    top_project: id,
    creator_id: `CREATOR_ID_${id}`,
    name: `PROJECT NAME ${id}`,
    acl: 'owner',
    creator: `CREATOR NAME ${id}`,
    last_updated: '2016-03-31T08:54:52Z',
    created_at: '2016-03-31T04:13:59Z',
    kind: 'full',
    mt_ver: 'stable',
    disabled: false,
    ...overrides,
  };
}

export default projectFactory;
