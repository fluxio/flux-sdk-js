# Flux-SDK-Common

This directory contains the core source code for the Flux JavaScript SDK.
It is not intended for direct usage.

Developers working with the SDK should instead use `flux-sdk-browser` or `flux-sdk-node`,
depending on which environment they are targeting.

* [Installing](#installing)
* [Running Tests](#running-tests)
* [Directory Structure](#directory-structure)

## <a id="installing"></a>Installing

From this directory (`flux-sdk-js/flux-sdk-common`):

```
npm link
```

This will install all dependencies, build the source code, and provide a
sym-linked version to npm so that running `npm install flux-sdk-common`
from another directory (e.g., `flux-sdk-js/flux-sdk-browser`) will use the
local version.

## <a id="installing"></a>Running Tests

Make sure you set up your env by following these instructions
https://docs.google.com/document/d/1joaFumoetcAfN9xCU-ND7vr2dMUXPGaNqa6syz_EqyU/edit#
Also see the Testing section in flux-sdk-node/README.md

* To run the linter and tests once: `npm run check`
* To run the tests once (no linting): `npm test`
* To run the tests continuously on changes: `npm run test:watch`

## <a id="directory-structure"></a>Directory Structure

* **`/spec`:** Contains unit tests for the JS SDK
* **`/src`:** Root source directory
  * **`/src/config`:** Configuration
  * **`/src/constants`:** Constants, such as API endpoint paths
  * **`/src/models`:** The core domain models, such as Cell and DataTale
  * **`/src/ports`:** Wrappers for environment-specific functionality, such
  as web sockets
  * **`/src/serializers`:** Default translation logic for the API responses
  * **`/src/utils`:** Utilities such as request logic
