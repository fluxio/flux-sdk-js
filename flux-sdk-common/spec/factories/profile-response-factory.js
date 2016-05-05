function profileFactory(id, email, firstName, lastName, ...overrides) {
  return {
    id,
    email,
    first_name: firstName,
    last_name: lastName,
    makerid: email,
    display_name: `${firstName} ${lastName}`,
    kind: 'maker',
    cohort: process.env.USER, //
    account_type: 'Self-Service', //
    external_user: false, //
    ...overrides,
  };
}

export default profileFactory;
