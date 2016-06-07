#!/usr/bin/env bash

set -e

REQUIRED_ENV_VARIABLES=(
  "CLIENT_ID"
  "CLIENT_SECRET"
  "ACCESS_TOKEN"
  "FLUX_TOKEN"
)

for variable in $REQUIRED_ENV_VARIABLES; do
  if [ -z ${!variable} ]; then
    echo "$variable must be set"
  fi
done

pushd `dirname $0`
  pushd flux-sdk-common
    npm link
  popd

  pushd flux-sdk-node
    npm link flux-sdk-common
    npm i
    npm run test:e2e
  popd
popd
