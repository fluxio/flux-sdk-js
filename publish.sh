#!/usr/bin/env bash

# Instructions for publishing the JS SDK to NPM.
#
# 1. Run all the tests!!!!!
# 2. Update all references to the version, e.g.: `git grep <old_version> | grep -v shrinkwrap`
# 3. Update CHANGELOG.md to include the new changes
# 4. Run this script: `./publish.sh`.
# 5. Add a commit to bump the version.
# 6. Tag the commit with `v<version #>`.
# 7. Push the commit and tag:
#      `git push upstream master && git push upstream master —-tags`
#   (assuming fluxio/flux-sdk-js is set as the `upstream` remote).
#
# NOTE: If `npm install` fails, try running `npm link flux-sdk-common`
# *first* and then retrying `npm install`

SDK_TYPES=(
  "flux-sdk-browser"
  "flux-sdk-node"
  "flux-sdk-apps-script"
)

publish () {
  pushd `dirname $0` > /dev/null
    pushd flux-sdk-common > /dev/null
      echo "Setting up flux-sdk-common"
      rm -rf npm-shrinkwrap.json node_modules
      npm link
      npm shrinkwrap --dev
      echo "Publishing flux-sdk-common"
      npm publish
    popd > /dev/null

    for SDK_TYPE in ${SDK_TYPES[*]}; do
      pushd $SDK_TYPE > /dev/null
        echo "Setting up $SDK_TYPE"
        rm -rf npm-shrinkwrap.json node_modules
        npm link flux-sdk-common
        npm install
        npm shrinkwrap --dev
        echo "Publishing $SDK_TYPE"
        npm publish
      popd > /dev/null
    done
    npm run ignore-shrinkwrap
  popd > /dev/null
}

# y/n confirmation from http://stackoverflow.com/questions/3231804/in-bash-how-to-add-are-you-sure-y-n-to-any-command-or-alias
read -r -p "Have you updated the version already? [y/N] " response
case $response in
  [yY][eE][sS]|[yY])
    publish
    ;;
  *)
    echo "You must first update the version!"
    ;;
esac
