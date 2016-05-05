# Flux Browser SDK

* [Installation](#installation)
* [Environment Configuration](#environment-configuration)
* [Development](#development)
* [Documentation](/docs)
* [Example](/flux-sdk-browser/example)

## Installation

### Using npm (recommended)

```
npm install --save flux-sdk-browser
```

The Flux SDK expects `process.env.NODE_ENV` to be set at build time. We suggest
[envify](https://github.com/hughsk/envify) or
[loose-envify](https://github.com/zertosh/loose-envify) with
[browserify](http://browserify.org/) or
[DefinePlugin](https://webpack.github.io/docs/list-of-plugins.html#defineplugin)
for [webpack](https://webpack.github.io). Other build processes should also have
tools and plugins with which you can set build-time variables.

### Using a script tag

Production version:

*`<version>` indicates the SDK version from
[here](/flux-sdk-browser/package.json), e.g., `0.3.0`.*,*`<version>` indicates
the SDK version from [here](/flux-sdk-browser/package.json), e.g., `0.3.0`.*

```
<script src="https://flux.io/sdk/<version>/flux-sdk.min.js"></script>
```

Development version:

```
<script src="https://flux.io/sdk/<version>/flux-sdk.js"></script>
```

This makes the SDK available as `window.Flux`.

## Environment Configuration

**process.env.NODE_ENV**: By default, the SDK runs in debug/development mode.
Set NODE_ENV to `production` to exit development mode.

## Development

`flux-sdk-node` provides a thin wrapper around `flux-sdk-common` in order to
set up a node-specific environment (e.g., it sets up web sockets). Most
development happens in `flux-sdk-common`.

### Testing

`flux-sdk-browser` contains some end-to-end tests. The core test suite is
located in `flux-sdk-node/spec`.

This test suite requires the following environment configuration:

**TEST_CLIENT_ID**: Your (test) client ID
**TEST_EMAIL**: Your test account's email address
**TEST_PASSWORD**: Your test account's password
**TEST_FLUX_URL** *(default: `https://flux.io`)*: The URL of the Flux version
that you are testing against
**TEST_DEBUG** *(default: `false`)*: Set to `true` to make Nightmare visible
