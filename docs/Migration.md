# Migrating from an Older Version

## <a id="migrating-to-0_3_x"></a>Migrating to `0.3.x`

`0.3.0` represented a big change for the SDK, with lots of changes meant to
bring in new functionality, increase stability and security, and improve
usability.

In particular, the following are breaking changes:

* `window.Flux` was renamed to `window.FluxSdk`, and has a
[new signature](./api/FluxSdk.md#constructor)
* `Flux.login` has been deprecated and split into two methods,
[`getAuthorizeUrl`](./api/FluxSdk.md#getauthorizeurl) and
[`exchangeCredentials`](./api/FluxSdk.md#exchangecredentials). You are now
responsible for storing credentials yourself.
  * Please see the
  [Implicit Flow guide](./advanced/authentication-authorization/ImplicitFlow.md) for more
  details on how to set this up
* `User.getwhoami` is now [`User.fetchProfile`](./api/User.md#fetchprofile)
* `Datatable` has been renamed to [`DataTable`](./api/DataTable.md). Similarly
named methods have also been renamed to match, e.g., from `Project.getDatable`
to [`Project.getDataTable`](./api/Project.md#getdatatable)
* `Datatable.capability` is now
[`DataTable.fetchCapability`](./api/DataTable.md#fetchcapability)
* `Datatable.project` has been deprecated with no new equivalent
* `Cell`-related methods have been renamed and, in some cases, have new signatures:
  * `Datatable.cells` is now
  [`DataTable.listCells`](./api/DataTable.md#listcells)
  * `Datatable.get` is now
  [`DataTable.fetchCell`](./api/DataTable.md#fetchcell)
  * `Datatable.delete` is now
  [`DataTable.deleteCell`](./api/DataTable.md#deletecell)
  * `Datatable.create` is now
  [`DataTable.createCell`](./api/DataTable.md#deletecell)
  * `Datatable.set` is now
  [`DataTable.updateCell`](./api/DataTable.md#updatecell)
* Web socket handling has been changed, so that accessing a data table no longer
automatically opens a web socket. Please see
[`DataTable.openWebSocket`](./api/DataTable.md#openwebsocket) and
[`DataTable.addWebSocketHandler`](./api/DataTable.md#addwebsockethandler) for more details.

Note that there may be additional breaking changes.

Questions? Please [let us know](mailto:sdk@flux.io)!
