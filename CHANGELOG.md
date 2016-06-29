# Change Log

This document tracks noteworthy changes to the Flux JavaScript SDK.

The JavaScript SDK follows [Semantic Versioning](http://semver.org).
While the API is considered unstable until we reach `1.0.0`, we will attempt
to increment the minor version (`Y` in `x.Y.z`) if and when there are
breaking changes.

## [Unreleased]

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
