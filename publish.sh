#!/usr/bin/env bash

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

