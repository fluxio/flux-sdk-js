#!/usr/bin/env bash

NSW=npm-shrinkwrap.json
NSW_IGNORED=npm-shrinkwrap.json.ignore
SDK_DIRS=("." "./flux-sdk-common" "./flux-sdk-apps-script" "./flux-sdk-browser" "./flux-sdk-node")
    
handle () {
    from=$1
    to=$2
    files=`find . -iname $from`
    NOT_CHANGED=()
    for file in $files; do
        moved=false
        for dir in ${SDK_DIRS[*]}; do
            if [ "$file" == "$dir/$from" ]; then
                echo -e "\t$dir/$to"
                mv $dir/$from $dir/$to
                moved=true
            fi
        done
        if [ $moved == false ]; then
            NOT_CHANGED+=($file)
        fi
    done
    echo ""
    echo "$from files not changed:"
    for f in ${NOT_CHANGED[*]}; do
        echo -e "\t$f"
    done
}

usage () {
    echo -e "usage: ./shrinkwrap.sh [obey | ignore | status]\n"
    echo -e "\tobey: \`npm install\` will use shrinkwrapped dependencies."
    echo -e "\tignore: \`npm install\` will not use shrinkwrapped dependencies."
    echo -e "\tstatus: see which shrinkwrap files have been ignored."
    echo ""
}

if [ "$1" == "ignore" ]; then
    handle $NSW $NSW_IGNORED
elif [ "$1" == "obey" ]; then
    handle $NSW_IGNORED $NSW
elif [ "$1" == "status" ]; then
    echo "ignored by npm:"
    find . -iname $NSW_IGNORED
    echo ""
    echo "used by npm:"
    find . -iname $NSW
else
    usage
fi

