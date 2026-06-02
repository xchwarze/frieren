#!/bin/sh

SD_FLAG=0
DEPS=""

usage() {
    echo "Usage: $0 [install|remove] --sd [0|1] --deps \"dep1 dep2 dep3\""
    exit 1
}

# Parse arguments
ACTION=$1
shift

while [ "$#" -gt 0 ]; do
    case $1 in
        --sd) SD_FLAG="$2"; shift ;;
        --deps) DEPS="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; usage ;;
    esac
    shift
done

if [ -z "$ACTION" ] || [ -z "$DEPS" ]; then
    echo "Action and dependencies are required."
    usage
fi

install_package() {
    TARGET=$1
    PACKAGE=$2

    if [ "$TARGET" -eq 1 ] && [ -n "$(mount | grep 'on /sd')" ]; then
        echo "Installing $PACKAGE on SD"
        /bin/opkg --dest sd install "$PACKAGE"
    else
        echo "Installing $PACKAGE on disk"
        /bin/opkg install "$PACKAGE"
    fi

    if [ $? -ne 0 ]; then
        echo "ERROR: opkg install $PACKAGE failed"
        exit 1
    fi
}

remove_package() {
    PACKAGE=$1
    echo "Removing $PACKAGE"
    /bin/opkg remove "$PACKAGE"

    if [ $? -ne 0 ]; then
        echo "ERROR: opkg remove $PACKAGE failed"
        exit 1
    fi
}

if [ "$ACTION" = "install" ]; then
    echo "Starting dependency installation..."
    echo "Updating packages database..."
    /bin/opkg update
    if [ $? -ne 0 ]; then
        echo "ERROR: opkg update failed"
        exit 1
    fi

    for DEP in $DEPS; do
        install_package $SD_FLAG $DEP
    done

    echo "Installation complete!"
elif [ "$ACTION" = "remove" ]; then
    echo "Removing dependencies..."

    for DEP in $DEPS; do
        remove_package $DEP
    done

    echo "Removal complete!"
fi
