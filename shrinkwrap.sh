#!/usr/bin/env bash

# Instructions for publishing the JS SDK to NPM.
#
# 1. Run all the tests!!!!!
# 2. Update all references to the version, e.g.: `git grep <old_version> | grep -v shrinkwrap`
# 3. Update CHANGELOG.md to include the new changes
# 4. Run this script with the publish argument: `./shrinkwrap.sh publish`.
# 5. Add a commit to bump the version.
# 6. Tag the commit with `v<version #>`.
# 7. Push the commit and tag:
#      `git push upstream master && git push upstream master —-tags`
#   (assuming fluxio/flux-sdk-js is set as the `upstream` remote).
#
# NOTE: If `npm install` fails, try running `npm link flux-sdk-common`
# *first* and then retrying `npm install`

NSW=npm-shrinkwrap.json
SDK_TYPES=(
  "flux-sdk-browser"
  "flux-sdk-node"
  "flux-sdk-apps-script"
)

activate () {
    if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
        echo "Specify which shrinkwrap to execute. Options: dev, prod"
    else
        SDK_TYPES+=(".")
        SDK_TYPES+=("flux-sdk-common")
        pushd `dirname $0` > /dev/null
            for SDK_TYPE in ${SDK_TYPES[*]}; do
                pushd $SDK_TYPE > /dev/null
                    cp -f $NSW.$1 $NSW
                popd > /dev/null
            done
        popd > /dev/null
    fi
}

deactivate () {
    SDK_TYPES+=(".")
    SDK_TYPES+=("flux-sdk-common")
    pushd `dirname $0` > /dev/null
        for SDK_TYPE in ${SDK_TYPES[*]}; do
            pushd $SDK_TYPE > /dev/null
                echo "Removing $SDK_TYPE/$NSW"
                rm -f $NSW
                if [ "$1" == "clean" ]; then
                    echo "Removing $SDK_TYPE/$NSW.dev"
                    rm -f $NSW.dev
                    echo "Removing $SDK_TYPE/$NSW.prod"
                    rm -f $NSW.prod
                fi
            popd > /dev/null
        done
    popd > /dev/null
}

shrinkwrap-all () {
  pushd `dirname $0` > /dev/null
    pushd flux-sdk-common > /dev/null
      echo "Generating shrinkwraps for flux-sdk-common"
      rm -rf npm-shrinkwrap.json node_modules
      npm link
      npm shrinkwrap --dev
      mv $NSW $NSW.dev
      npm shrinkwrap
      if [ "$1" == "publish" ]; then
          echo "Publishing flux-sdk-common"
          npm publish
      fi
      mv $NSW $NSW.prod
      cp $NSW.dev $NSW
    popd > /dev/null

    for SDK_TYPE in ${SDK_TYPES[*]}; do
      pushd $SDK_TYPE > /dev/null
        echo "Generating shrinkwraps for $SDK_TYPE"
        rm -rf npm-shrinkwrap.json node_modules
        npm link flux-sdk-common
        npm install
        npm shrinkwrap --dev
        mv $NSW $NSW.dev
        npm shrinkwrap
        if [ "$1" == "publish" ]; then
            echo "Publishing $SDK_TYPE"
            npm publish
        fi
        mv $NSW $NSW.prod
        cp $NSW.dev $NSW
      popd > /dev/null
    done
  popd > /dev/null
  rm -rf npm-shrinkwrap.json node_modules
  npm install
  npm shrinkwrap --dev
  cp $NSW $NSW.dev
}

usage () {
    echo -e "usage: ./shrinkwrap.sh [activate | deactivate | generate | publish ]\n"
    echo ""
    echo -e "\tactivate [dev|prod]: \`npm install\` will use shrinkwrapped dependencies specified."
    echo -e "\tdeactivate: \`npm install\` will not use any shrinkwrapped dependencies."
    echo -e "\tgenerate: generate both prod and dev shrinkwraps for all SDKs, leaving the dev shrinkwrap activated."
    echo -e "\tclean: remove all shrinkwrap files."
    echo -e "\tpublish: publish SDKs to npm with prod shrinkwraps."
    echo ""
}

if [ "$1" == "deactivate" ]; then
    deactivate
elif [ "$1" == "activate" ]; then
    activate $2
elif [ "$1" == "generate" ]; then
    shrinkwrap-all
elif [ "$1" == "clean" ]; then
    deactivate clean
elif [ "$1" == "publish" ]; then
    # y/n confirmation from http://stackoverflow.com/questions/3231804/in-bash-how-to-add-are-you-sure-y-n-to-any-command-or-alias
    read -r -p "Have you updated the version already? [y/N] " response
    case $response in
      [yY][eE][sS]|[yY])
        shrinkwrap-all publish
        ;;
      *)
        echo "You must first update the version!"
        ;;
    esac
else
    usage
fi
