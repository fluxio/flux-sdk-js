# Flux JavaScript SDK

Welcome to the Javascript Flux SDK!

Documentation on how to use the SDK can be found [here](https://www.gitbook.com/book/flux/flux-javascript-sdk/details).

This document describes the requirements for developing the SDK itself and is
primarily intended for Flux developers and advanced SDK users.

* [Prerequisites](#prerequisites)
* [Previewing the Documentation](#previewing-the-documentation)
* [Building the Source Code](#building-the-source-code)
* [Built Source Code](#built-source-code)
* [Directory Structure](#directory-structure)

## <a id="prerequisites"></a>Prerequisites

* [Node](https://nodejs.org), version >= 4

## <a id="previewing-the-documentation"></a>Previewing the Documentation

From the root directory (`flux-sdk-js`):

1. `npm install`
1. Open `<root>/flux-sdk-js/_book/index.html` in your browser, where
`<root>` is the root path

## <a id="building-the-source-code"></a>Building the Source Code

From the root directory (`flux-sdk-js`), run:

```
npm install
```

This will build the source code for all versions of the JavaScript SDK
(Node, browser, and Apps Script) as well as the documentation.

### <a id="built-source-code"></a>Built Source Code

Once the source code has been built, the built files are structured as follows:

* Browser version:
  * `flux-sdk-js/flux-sdk-browser/dist/flux-sdk-min.js` - UMD version
    * For use in production
    * **Usable directly, without any additional build process**
  * `flux-sdk-js/flux-sdk-browser/dist/flux-sdk.js` - UMD version (debug)
    * Same as above, but meant for use in development
  * `flux-sdk-js/flux-sdk-browser/lib/index.js` - CommonJS version
    * Provided via `npm install flux-sdk-browser` when used with most
    build tools
  * `flux-sdk-js/flux-sdk-browser/es/index.js` - ES6 version
    * Provided via `npm install flux-sdk-browser` when used with tools like
    Rollup
* Node version:
  * `flux-sdk-js/flux-sdk-browser/lib/index.js` - CommonJS version
    * Provided via `npm install flux-sdk-node` when used with most
    build tools
  * `flux-sdk-js/flux-sdk-browser/es/index.js` - ES6 version
    * Provided via `npm install flux-sdk-node` when used with most
    build tools
* Apps Script version:
  * `flux-sdk-js/flux-sdk-browser/dist/flux-sdk-apps-script-min.js`
    * For use in production
  * `flux-sdk-js/flux-sdk-browser/dist/flux-sdk-apps-script.js`
    * Same as above, but meant for use in development

If you want to use the latest pre-publish version of the SDK in your project,
you should `npm link` from the subdirectory containing the platform-specific
SDK you want to use, and then run `npm link flux-sdk-xxxxxx` in the package
that depends on the SDK. For example, if you are a Flux internal developer
working on the client, you should clone and build this repo, then `cd
flux-sdk-browser` and `npm link`.  Finally, go back to wherever you depend on
the SDK (perhaps `client/web/src/maker-tools`) and `npm link flux-sdk-browser`.

## <a id="directory-structure"></a>Directory Structure

* **`flux-sdk-js`**
  * The top-level directory
  * Not intended for direct use or publication
  * Provides convenience scripts for building and testing the SDK
  * Contains documentation-related scripts
* **`flux-sdk-js/docs`**
  * Contains documentation
  * NOTE: The scripts to build and preview and the docs are in `flux-sdk-js`!
* **`flux-sdk-js/flux-sdk-common`**
  * Not intended for direct use
  * Contains the core source code of the SDK
* **`flux-sdk-js/flux-sdk-browser`**
  * Intended for direct use
  * Provides a version of the SDK meant specifically for browser usage
* **`flux-sdk-js/flux-sdk-node`**
  * Intended for direct use
  * Provides a version of the SDK meant specifically for Node usage
* **`flux-sdk-js/flux-sdk-apps-script`**
  * Intended for direct use
  * Provides a version of the SDK meant specifically for Google Apps Script
  usage, e.g., for Google Docs plugins

## <a id="copyright-notice"></a>Copyright and License Notice

Copyright (c) 2016 Flux Factory, Inc.

This software is licensed under the MIT license. Please see the "LICENSE"
file for the license text.
