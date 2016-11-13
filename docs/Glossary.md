# Glossary

* [ClientInfo](./Glossary.md#clientinfo)
* [Credentials](./Glossary.md#credentials)
* [IdToken](./Glossary.md#idtoken)
* [Project](./Glossary.md#project)
* [User](./Glossary.md#user)
* [Permission](./Glossay.md#permission)

We use syntax based on
[Flow syntax](http://flowtype.org/docs/quick-reference.html) to document types.
`?` indicates that a value is optional.

### ClientInfo

TODO

### Credentials

```js
type Credentials = {
  clientId: String;
  accessToken: String;
  fluxToken: String;
  tokenType: String | 'bearer';
  refreshToken: ?String;
  scope: ?String;
  tokenExpiry: ?number;
  clientInfo: ClientInfo;
  idToken: ?IdToken;
}
```

### IdToken

```js
type IdToken = Object
```

### Project

TODO

### User

TODO

### Permission

```
string "collaborator" | "owner" | "viewer"
```
