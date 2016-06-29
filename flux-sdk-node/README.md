# Flux Node SDK

* [Installation](#installation)
* [Environment Configuration](#environment-configuration)
* [Development](#development)
* [Documentation](https://flux.gitbooks.io/flux-javascript-sdk/content/)
* [Example](https://github.com/fluxio/flux-sdk-js/tree/master/flux-sdk-node/example)

## Installation

1. Install [Node](https://nodejs.org/en/) >= 4
  Earlier versions may work, but should be used with caution.
1. `npm install --save flux-sdk-node`
1. Have fun!

## Environment Configuration

**NODE_ENV**: By default, the SDK runs in debug/development mode. Set `NODE_ENV`
to `production` to exit development mode.

## Development

`flux-sdk-node` provides a thin wrapper around `flux-sdk-common` in order to
set up a node-specific environment (e.g., it sets up web sockets). Most
development happens in `flux-sdk-common`.

### Testing

`flux-sdk-node` contains end-to-end tests. The core test suite is located in
`flux-sdk-node/spec`.

**NOTE:** Unfortunately, the end-to-end test suite is currently very stateful.
This affects both writing and running tests.

This test suite requires the following environment configuration:

**CLIENT_ID**: Your (test) client ID

**CLIENT_SECRET**: Your (test) client secret

**FLUX_URL**: The URL of the Flux genie server you are testing against.

**TEST_EMAIL**: Your test account's email address

**TEST_PASSWORD**: Your test account's password

**DEBUG** *(default: `false`)*: Set to `true` to make Nightmare visible

**EXAMPLE_PORT** *(default: `4567`)*: Set to change the port used in any tests
that set up a full server (i.e., the auth flow tests).

**SKIP_AUTH_FLOW** *(default: `false`)*: Set to bypass the auth flow when running tests. This
requires `ACCESS_TOKEN` and `FLUX_TOKEN` to be set.

**ACCESS_TOKEN**: Set if using `SKIP_AUTH_FLOW` is `true`. Must be a valid token, e.g., from an
existing session.

**FLUX_TOKEN**: Set if using `SKIP_AUTH_FLOW` is `true`. Must be a valid token that corresponds
to the provided `ACCESS_TOKEN`.
