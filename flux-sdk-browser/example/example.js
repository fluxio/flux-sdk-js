var CLIENT_ID = 'replace-with-your-client-id';

var sdk = new FluxSdk(CLIENT_ID, {
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
