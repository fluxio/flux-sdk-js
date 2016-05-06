# Browser Setup

* [Simple setup](./BrowserSetup.md#simple-setup)
  * [Prerequisites](./BrowserSetup.md#simple-prerequisites)
  * [Instructions](./BrowserSetup.md#simple-instructions)
* [Advanced setup](./BrowserSetup.md#simple-setup)
  * [Prerequisites](./BrowserSetup.md#simple-prerequisites)
  * [Instructions](./BrowserSetup.md#simple-instructions)

## <a id="simple-setup"></a>Simple Setup

### <a id="simple-prerequisites"></a>Prerequisites

#### <a id="client-id">Client ID

Your app needs its own client ID to connect to Flux. To get one, create a new
app in the Flux app manager.
<!--TODO: link to app manager-->

#### <a id="server">Server

In order for your app to send requests to Flux, you need to run it with a
server. The simplest way to do this is with Python's
[SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html) -
it really lives up to its name!

1. Check that you have Python installed. If you don't,
[install](https://www.python.org/downloads/) it.
1. In your terminal, `cd` to the root directory of your app.
1. Run `python -m SimpleHTTPServer <port>`. The default port is `8080`.
  * Make sure to use the right port when you specify your redirect URL!
1. Navigate to `http://localhost:<port>` in your browser, where `<port>` is
`8080` or, if you specified one, the port from the previous step
1. Voila!

#### <a id="redirect-url">Redirect URL

Flux needs to know where your app lives! In the app manager, add the redirect
URL for your app. For example, this might be something like
`http://localhost:8080` or `http://localhost:3000/auth_callback`.

<!--TODO: link to app manager-->

### <a id="simple-instructions"></a>Instructions

In your HTML file, add the Flux SDK script **above** your app's script(s). This
will set `window.FluxSdk` so that you can access `FluxSdk` in your JavaScript.

For example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My Fancy Flux App</title>
    <script src="https://npmcdn.com/flux-sdk-browser@0.3.0/dist/flux-sdk-min.js"></script>
    <script src="./my-app.js"></script>
  <!-- ... -->
```

## <a id="advanced-setup"></a> Advanced Setup

TODO
