# Change Log

This document tracks noteworthy changes to the Flux JavaScript SDK.

The JavaScript SDK follows [Semantic Versioning](http://semver.org).
While the API is considered unstable until we reach `1.0.0`, we will attempt
to increment the minor version (`Y` in `x.Y.z`) if and when there are
breaking changes.

## [0.5.2] - 11/29/2017

* Raw request object is now returned for Issue viewpoint snapshots, leaving the handling up to the client.

## [0.5.1] - 11/29/2017

* Issue viewpoint snapshots now returned as image uris.

## [0.5.0] - 10/11/2017

* Add issue service capabilities.

## [0.4.9] - 6/8/2017

* Add geometry block execution capabilities.

## [0.4.8] - 1/11/2017

* Add Flow-as-a-Service execution capabilities.

## [0.4.7] - 11/22/2016

* Improves form handling and adds url encoding of objects.
* Removes shrinkwraps.

## [0.4.6] - 11/14/2016

* Adds several new methods to the Node SDK: `project.share`, `project.unshare`,
  `cell.publish`, `cell.unpublish`.
* Adds `User.listUsers` and `project.listUsers`.
* Implements form handling in the `authenticatedRequest` helper.

## [0.4.5] - 9/22/2016

* Removes developer dependencies from published shrinkwrap. npm installing any
  of the SDKs will no longer download build tools like Babel.
* Adds a helper script for manage shrinkwrapping and moves the publish functions
  to it.
* Use unpkg.com instead of npmcdn.com in the documentation.

## [0.4.4] - 8/25/2016

* Increments version to publish a minor change to the history serializer needed
  by internal Flux developers.
* Add handling for CELL\_READ notifications.
* Fix base64 encoding for Google Apps Script SDK.

## [0.4.3] - 7/28/2016

* Updates `dataTable.fetchHistory` and `cell.fetchHistory` to enable
arbitrary query options and, by default, return the host file name for
history events

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
