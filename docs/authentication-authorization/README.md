# Authentication and Authorization

* [Server Flow](./ServerFlow.md)
* [Implicit Flow](./ImplicitFlow.md)

Flux uses [OpenID Connect](http://openid.net/connect/) integrated with
[OAuth 2.0](http://tools.ietf.org/html/rfc6749) for authentication and
authorization.

This is a multi-step process with a few different variations, such as the
"server" flow (e.g., for Node servers) and the "implicit" flow (e.g., for web
apps).

We recommend Google's guides on
[OpenID Connect](https://developers.google.com/identity/protocols/OpenIDConnect)
and [OAuth 2.0](https://developers.google.com/identity/protocols/OAuth2) for
more information on the details.

The JavaScript SDK provides helper methods to simplify the
authentication/authorization process:
[#getAuthorizationUrl](../api/FluxSdk.md#getauthorizeurl) and
[#exchangeCredentials](../api/FluxSdk.md#exchangecredentials).
