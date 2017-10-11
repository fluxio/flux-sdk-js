var CLIENT_ID = 'f61a840c-5434-424d-896b-732a71bf6888';

var sdk = new FluxSdk(CLIENT_ID, {
  fluxUrl: 'https://localhost:8443',
  redirectUri: window.location.origin
});

if (!getCredentials()) {
  if (!window.location.hash.match(/access_token/)) {
    window.location.assign(sdk.getAuthorizeUrl(getState(), getNonce()));
  } else {
    sdk.exchangeCredentials(getState(), getNonce())
      .then(function(credentials) {
        setCredentials(credentials);
      })
      .then(function() {
        renderRoot();
      });
  }
} else {
  renderRoot();
}

function renderRoot() {
  sdk.getUser(getCredentials())
    .fetchProfile()
    .then(function(profile) {
      document.getElementById('root').textContent = 'Hello, ' + profile.displayName;
    });
}

function generateSecureValue() {
  /* eslint-disable */
  var randomNumbers = window.crypto.getRandomValues(new Uint32Array(3));
  /* eslint-enable */
  return btoa(randomNumbers.join('')).slice(0, 32).replace(/[\+|\/]/g, '0');
}

function getState() {
  var state = localStorage.getItem('state') || generateSecureValue();
  localStorage.setItem('state', state);
  return state;
}

function getNonce() {
  var nonce = localStorage.getItem('nonce') || generateSecureValue();
  localStorage.setItem('nonce', nonce);
  return nonce;
}

function getCredentials() {
  return JSON.parse(localStorage.getItem('credentials'));
}

function setCredentials(credentials) {
  resetCredentials();
  localStorage.setItem('credentials', JSON.stringify(credentials));
}

function resetCredentials() {
  localStorage.clear();
}

function getTopics() {
  var state = {
    user: sdk.getUser(getCredentials()),
    project: null,
    topics: null
  };
  return getAProject(state)
  .then(listTopics);
}

function getAProject(state) {
  return state.user.listProjects()
  .then(function(projects) {
    var projectId = projects.entities[0].id;
    state.project = state.user.getProject(projectId);
    return state;
  });
}

function listTopics(state) {
  return state.project.getTopics()
  .then(function(topics) {
    state.topics = topics;
    return state;
  });
}
