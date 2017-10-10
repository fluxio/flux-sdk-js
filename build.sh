#!/usr/bin/env bash

set -ex

pushd `dirname $0`
  pushd flux-sdk-common
    npm link
  popd

  pushd flux-sdk-node
    npm link flux-sdk-common
    npm link
    pushd example
      npm link flux-sdk-common
      npm install
    popd
  popd

  pushd flux-sdk-browser
    npm link flux-sdk-common
    npm link
    pushd example
      cp ../dist/flux-sdk.js .
      cp ../dist/flux-sdk.js.map .
    popd
  popd

  pushd flux-sdk-apps-script
    npm link flux-sdk-common
    npm install
  popd
popd
