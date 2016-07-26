# Change Log

This document tracks noteworthy changes to the Flux JavaScript SDK.

The JavaScript SDK follows [Semantic Versioning](http://semver.org).
While the API is considered unstable until we reach `1.0.0`, we will attempt
to increment the minor version (`Y` in `x.Y.z`) if and when there are
breaking changes.

## [0.4.2] - 7/26/2016

* Adds `dataTable.removeWebSocketHandlers` to remove all handlers, or all
handlers matching the specified notification types, from a data table's web
socket
* Extends the signature of `dataTable.closeWebsocket` to enable removing all
of that data table's web socket handlers when the web socket is closed

## [0.4.1] - 7/25/2016

* Makes the current version accessible on `FluxSdk.version` or `sdk.version`
* Allow unicode characters in cell names, values, etc.
* Fix bug when creating or updating cells with falsy values

## [0.4.0] - 7/7/2016

* Update dataTable.fetchHistory to accommodate the changes to the history API **(breaking)**

## [0.3.2] - 6/28/2016

* Improves web socket reconnection, particular with respect to ping/pong expectations

## [0.3.1] - 6/9/2016

* Fixed a bug where handlers would get multiple times if a data table's web socket was openedm
multiple times
* Adds relevant GitHub and NPM links throughout docs
* Makes `cell.update` behave more consistently, such that only specified properties are changed
* Enables unlocking of cells
* Cleans up error messages passed through from the server
* Fixes web sockets in Node
* Fixes `cell.fetchHistory` and `dataTable.fetchHistory` filtering
* Fixes `cell.fetch` and `cell.update` in Apps Script
* Fixes error handling in Apps Script

## [0.3.0] - 5/5/2016

This marks the first open source release!

If you are coming from an earlier beta version, please check out our
[migration guide](https://flux.gitbooks.io/flux-javascript-sdk/content/docs/Migration.html).
Please [let us know](mailto:sdk@flux.io) if you have additional questions or feedback.
