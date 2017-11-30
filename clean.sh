#!/usr/bin/env bash

set -ex

pushd `dirname $0`
  pushd flux-sdk-common
    npm run clean;
    rm -rf node_modules;
  popd

  pushd flux-sdk-node
    npm run clean;
    rm -rf node_modules;
    pushd example
      rm -rf node_modules;
    popd
  popd

  pushd flux-sdk-browser
    npm run clean;
    rm -rf node_modules;
    pushd example
      git checkout .;
      npm run clean;
      rm -rf node_modules;
    popd
  popd

  pushd flux-sdk-apps-script
    npm run clean;
    rm -rf node_modules;
  popd
popd
