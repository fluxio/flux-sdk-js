# Implicit Flow

* [The Flow](./ImplicitFlow.md#the-flow)
* [Complete Example](./ImplicitFlow.md#complete-example)

## The Flow

### <a id="step-1"></a>1. Initialize the Flux SDK

Initialize an instance of the Flux SDK using its
[constructor](../../api/FluxSdk.md#constructor). You must provide the `clientId`
that you received when you registered your app with Flux.

**IMPORTANT:** Do not provide your app's `clientSecret`! Secrets should never be
provided in client-facing code.

You may also provide a `redirectUri` here, which is required in later steps. It
can be provided or overridden later if need be, but in most cases, it is enough
to provide it at this stage.

```js
var sdk = new FluxSdk('YOUR-CLIENT-ID', {
  redirectUri: 'https://your-app.com/auth_callback'
};
```

### <a id="step-2"></a>2. Storing Credentials

Your app will need a way to store and access user credentials, such as
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

For example:

```js
function getFluxCredentials() {
  return JSON.parse(localStorage.getItem('fluxCredentials') || {});
}

function setFluxCredentials(credentials) {
  localStorage.setItem('fluxCredentials', JSON.stringify(credentials);
}
```

### <a id="step-3"></a>3. Create unique state and nonce values

These values are used to protect your users from
[cross-site request forgery (CSRF)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF))
and [replay](https://en.wikipedia.org/wiki/Replay_attack) attacks.

To ensure that they are sufficiently secure, both values should be unique (one
per user session) and computationally difficult to guess.

For example:

```js
function generateRandomToken() {
  var tokenLength = 24;
  var randomArray = [];
  var characterSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 0; i < tokenLength; i++) {
    randomArray.push(Math.floor(Math.random() * tokenLength));
  }
  return btoa(randomArray.join('')).slice(0, 48);
}

function getState() {
  var state = localStorage.getItem('state') || generateRandomToken();
  localStorage.setItem('state', state);
  return state;
}

function getNonce() {
  var nonce = localStorage.getItem('nonce') || generateRandomToken();
  localStorage.setItem('nonce', nonce);
  return nonce;
}
```

**NOTE:**
[`Math.random`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
is not cryptographically secure. Depending on what browsers you need to support
and how comfortable you feel using JavaScript packages, we suggest using
[`window.crypto.getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/RandomSource/getRandomValues)
or a package from npm.
<!--TODO: Just supply something?-->

### <a id="step-4"></a>4. Request authorization

Next, send the user to Flux to give your app consent to access their information.

We provide the helper method
[`getAuthorizeUrl`](../../api/FluxSdk.md#getauthorizeurl) to facilitate this
process. This method requires the state and nonce values generated in the
previous step as well as an HTTP endpoint (`redirectUri`) that is configured to
handle Flux's response. If you supplied a `redirectUri` when you initialized the
SDK and don't need to override it, you do not need to provide it again.

```js
var credentials = getFluxCredentials();
if (!credentials) {
  // Clear local storage in case there are old state or nonce values
  localStorage.clear();
  if (!window.location.hash.match(/access_token/)) {
    window.location.replace(sdk.getAuthorizeUrl(getState(), getNonce()));
  }
  // ...
}
```

### <a id="step-5"></a>5. Retrieve an access token and user information

From the endpoint specified as the `redirectUri` by the previous step, use the
helper method [`exchangeCredentials`](../../api/FluxSdk.md#exchangecredentials) to
exchange the data returned by Flux from the previous step for an access token
and user information. You must again provide the state and nonce from
[step 2](./ServerFlow.md#step-2). If you specified a `redirectUri` in
[step 3](./ServerFlow.md#step-3), you must specify it again here.

In return, you should receive a promise that resolves to the user's
credentials](../../Glossary.md#credentials), including the access token, their
basic information, their refresh token, and when the token expires. Most parts
of the returned credentials are required by subsequent requests and should be
stored, e.g., in the user's session.

Note that `exchangeCredentials` handles details such as confirming that the
response contains the correct state, nonce, and an appropriately signed ID token
for you. We will throw an error if we encounter anything suspicious. If you have
any questions or concerns about this, please let us know!

```js
var credentials = getFluxCredentials();
if (!credentials) {
  // ...
  if (window.location.hash.match(/access_token/) {
    sdk.exchangeCredentials(getState(), getNonce())
      .then(function(credentials) {
        setFluxCredentials(credentials);
      })
      .then(function() {
        // redirect somewhere else
      });
  }
}
```

### <a id="step-6"></a>6. Use the user's credentials in later endpoints

Now the fun begins! Use the credentials received in
[step 4](./ServerFlow.md#step-4) to access other endpoints from the Flux API,
such as the user's projects.

```js
// ...
var credentials = getFluxCredentials();
if (!credentials) {
  redirect('/login');
} else {
  var user = sdk.getUser(credentials);
  user.listProjects()
    .then(function(projects) {
      // do something interesting!
    });
}
```

## Complete Example

[Here](https://github.com/fluxio/flux-sdk-js/tree/master/flux-sdk-browser/example)
