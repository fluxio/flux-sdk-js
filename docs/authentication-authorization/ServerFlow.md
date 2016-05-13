# Server Flow

* [Storing Credentials](./ServerFlow.md#storing-credentials)
* [The Flow](./ServerFlow.md#the-flow)
* [Complete Example](./ServerFlow.md#complete-example)

## Storing Credentials

Your app will need a way to process and store user credentials, such as user sessions.

If you don't already have session storage set up, we suggest using a library like [express-session](https://github.com/expressjs/session). **[Note:](https://github.com/expressjs/session#sessionoptions)** For production purposes, express-session should be used with a non-default backing store, e.g., from [here](https://github.com/expressjs/session#compatible-session-stores).

## The Flow

All snippets below use [Express](https://expressjs.com).

### <a id="step-1"></a>1. Initialize the Flux SDK

Initialize an instance of the Flux SDK using its [constructor](../api/FluxSdk.md#constructor). You must provide the `clientId` and `clientSecret` that you received when you signed up as a Flux developer.

You may also provide a `redirectUri` here, which is required in subsequent steps. It can be provided or overridden later if need be, but in most cases, it is enough to provide it at this stage.


```js
var FluxSdk = require('flux-sdk-node');

var sdk = new FluxSdk('YOUR-CLIENT-ID', {
  clientSecret: 'YOUR-CLIENT-SECRET',
  redirectUri: 'https://your-app.com/auth_callback'
};
```

### <a id="step-2"></a>2. Create unique state and nonce values

These values are used to protect your users from [cross-site request forgery (CSRF)](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)) and [replay](https://en.wikipedia.org/wiki/Replay_attack) attacks.

To ensure that they are sufficiently secure, both values should be unique (one per user session) and computationally difficult to guess.

```js
var crypto = require('crypto');

function generateRandomToken() {
  return crypto.randomBytes(24).toString('hex');
}

app.use('/auth', function(req, res, next) {
  req.session.state = generateRandomToken();
  req.session.nonce = generateRandomToken();
  // ...
});
```

### <a id="step-3"></a>3. Request authorization

Next, send the user to Flux to give your app consent to access their information.

We provide the helper method [`getAuthorizeUrl`](../api/FluxSdk.md#getauthorizeurl) to facilitate this process. This method requires the state and nonce values generated in the previous step as well as an HTTP endpoint (`redirectUri`) that is configured to handle Flux's response. If you supplied a `redirectUri` when you initialized the SDK and don't need to override it, you do not need to provide it again.

```js
app.use('/auth', function(req, res, next) {
  // ...
  var authorizeUrl = sdk.getAuthorizeUrl(req.session.state, req.session.nonce);
  res.redirect(authorizeUrl);
}
```

### <a id="step-4"></a>4. Retrieve an access token and user information

From the endpoint specified as the `redirectUri` by the previous step, use the helper method [`exchangeCredentials`](../api/FluxSdk.md#exchangecredentials) to exchange the data returned by Flux from the previous step for an access token and user information. You must again provide the state and nonce from [step 2](./ServerFlow.md#step-2) as well as the `code`, `state`, and `flux_token` from the response's query parameters. If you specified a `redirectUri` in [step 3](./ServerFlow.md#step-3), you must specify it again here.

In return, you should receive a promise that resolves to the user's [credentials](../Glossary.md#credentials), including the access token, their basic information, their refresh token, and when the token expires. Most parts of the returned credentials are required by subsequent requests and should be stored, e.g., in the user's session.

Note that `exchangeCredentials` handles details such as confirming that the response contains the correct state, nonce, and an appropriately signed ID token for you. We will throw an error if we encounter anything suspicious. If you have any questions or concerns about this, please let us know!

```js
app.use('/auth_callback', function(req, res, next) {
  sdk.exchangeCredentials(req.session.state, req.session.nonce, req.query)
    .then(function(credentials) {
      req.session.fluxCredentials = credentials;
      res.redirect('/home');
    })
    .catch(function(error) {
      next(error);
    });
}
```

### <a id="step-5"></a>5. Use the user's credentials in later endpoints

Now the fun begins! Use the credentials received in [step 4](./ServerFlow.md#step-4) to access other endpoints from the Flux API, such as the user's projects.

```js
app.use('/projects', function(req, res, next) {
  var credentials = req.session.fluxCredentials;
  if (!credentials) {
    redirect('/auth');
  } else {
    sdk.getUser(credentials)
      .listProjects()
      .then(function(projects) {
        // do interesting things!
      })
      .catch(function(error) {
        next(error);
      });
  }
}
```

## Complete Example

[Here](https://github.com/fluxio/flux-sdk-js/tree/master/flux-sdk-node/example)
