#!/usr/bin/env bash

set -ex

pushd `dirname $0`
  pushd flux-sdk-common
    npm run check
  popd

  pushd flux-sdk-node
    npm run check
  popd

  pushd flux-sdk-browser
    npm run lint
  popd
popd
