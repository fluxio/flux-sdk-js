# FluxSdk

Instance methods:

* [constructor](./FluxSdk.md#constructor)
* [getAuthorizeUrl](./FluxSdk.md#getauthorizeurl)
* [exchangeCredentials](./FluxSdk.md#exchangecredentials)
* [getUser](./FluxSdk.md#getuser)

Static methods and properties:

* [User](FluxSdk.md#user)
* [Project](FluxSdk.md#project)
* [DataTable](FluxSdk.md#datatable)
* [Cell](FluxSdk.md#cell)
* [Constants](FluxSdk.md#constants)

## Instance Methods

### <a id="constructor"></a>constructor: `FluxSdk(clientId, options)`

#### Arguments

1. `clientId` *(String)*: The client ID provided to you when you created your
app.
1. `options` *(Object = `{ redirectUri: String, clientSecret: String,
fluxUrl: String`)*

  `redirectUri`: The URL that the user should be sent to by Flux after
  authorizing your app. This should be a URL that you specified when creating
  your app.

  `clientSecret`: The client secret provided to you when you created your app.
  **The client secret is required for Node apps, but SHOULD NOT be passed to
  browser apps!**

  `fluxUrl`: Use to override the base Flux URL, e.g., for testing purposes

<!--TODO: Add link to app manager when it exists-->

### <a id="getauthorizeurl"></a>`getAuthorizeUrl(state, nonce, [options])`

#### Arguments

1. `state` *(String)*: A secure (i.e., unique and non-guessable) string. If you
would like to maintain any state throughout the auth process, such as an
internal path that the user should be redirected to later, it should be encoded
into the state.
1. `nonce` *(String)*: A secure string.
1. `options` *(Object = `{ redirectUri: String }`)*

  `redirectUri`: This will override the `redirectUri` specified in the
  `constructor`.

  **Note:** The `redirectUri` in `getAuthorizeUrl` must match the `redirectUri`
  in `exchangeCredentials`

#### Returns

*(String)* The URL that the user should be sent to in order to authorize your
app.

### <a id="exchangecredentials"></a>`exchangeCredentials(state, nonce, urlQuery, [options])`

#### Arguments

1. `state` *(String)*: A secure string. **This should match the `state` passed
to `getAuthorizeUrl`**
1. `nonce` *(String)*: A secure string. **This should match the `nonce` passed
to `getAuthorizeUrl`**
1. `responseQuery` (Object = `{ code: String, state: String, flux_token:
String }`)

  The response from the Flux server when the user is redirected after
  authenticating your app.

  **Node:** These should come from the query params

  **Browser:** This is handled for you!

1. `options` (Object = `{ redirectUri: String }`)

  `redirectUri`: This will override the `redirectUri` specified in the
  `constructor`.
  **Note:** The `redirectUri` in `exchangeCredentials` must match the
  `redirectUri` in `getAuthorizeUrl`

#### Returns

*Promise --> [(Credentials)](../Glossary.md#credentials)* Validated credentials
that can be used to make subsequent requests on behalf of a user.

The credentials should be stored somewhere, such as in the app's session storage
if you are writing a Node e.g., Express) server or in the browser's
`localStorage` if you are writing a browser app.

### <a id="getuser"></a>`getUser(credentials)`

See [User#constructor](./User.md#constructor)

`sdk.getUser(credentials)` is equivalent to `new User(credentials)`

## Static Methods and Properties

### <a id="user"></a>`User(credentials)` (constructor)

See [User#constructor](./User.md#constructor)

### <a id="project"></a>`Project(credentials, id)` (constructor)

See [Project](./Project.md#constructor)

### <a id="datatable"></a>`DataTable(credentials, id)` (constructor)

See [DataTable#constructor](./DataTable.md#constructor)

### <a id="cell"></a>`Cell(credentials, dataTableId, id)` (constructor)

See [Cell#constructor](./Cell.md#constructor)

### <a id="constants"></a>Constants

TODO

