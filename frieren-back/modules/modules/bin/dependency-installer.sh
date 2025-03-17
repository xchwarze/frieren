#!/bin/sh

TIMESTAMP=$(date "+[%Y-%m-%d %H:%M:%S]")
LOG_FILE="/tmp/fm-dependencies.log"
FLAG_FILE="/tmp/fm-dependencies.flag"
SD_FLAG=0
DEPS=""

function usage {
    echo "Usage: $0 [install|remove] --sd [0|1] --deps \"dep1 dep2 dep3\""
    exit 1
}

function add_log {
    echo "$1"
    echo "$TIMESTAMP $1" >> "$LOG_FILE"
}

# Parse arguments
ACTION=$1
shift

while [[ "$#" -gt 0 ]]; do
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

if [ -f "$FLAG_FILE" ]; then
    exit 0
fi

# Start installation process
rm "$LOG_FILE"
add_log "Starting script with action: $ACTION"
touch "$FLAG_FILE"

install_package() {
    TARGET=$1
    PACKAGE=$2

    if [ "$TARGET" -eq 1 ] && [ -n "$(mount | grep 'on /sd')" ]; then
        add_log "Installing $PACKAGE on SD"
        /bin/opkg --dest sd install "$PACKAGE" >> "$LOG_FILE"
    else
        add_log "Installing $PACKAGE on disk"
        /bin/opkg install "$PACKAGE" >> "$LOG_FILE"
    fi

    if [ $? -ne 0 ]; then
        add_log "ERROR: opkg --dest $TARGET install $PACKAGE failed"
        rm "$FLAG_FILE"
        exit 1
    fi
}

remove_package() {
    PACKAGE=$1
    add_log "Removing $PACKAGE"
    /bin/opkg remove "$PACKAGE"
}

if [ "$ACTION" = "install" ]; then
    add_log "Update packages database..."
    /bin/opkg update
    if [ $? -ne 0 ]; then
        add_log "ERROR: opkg update failed"
        rm "$FLAG_FILE"
        exit 1
    fi

    for DEP in $DEPS; do
        install_package $SD_FLAG $DEP
    done

    add_log "Installation complete!"
elif [ "$ACTION" = "remove" ]; then
    add_log "Removing dependencies"

    for DEP in $DEPS; do
        remove_package $DEP
    done

    add_log "Removal complete!"
fi

rm "$FLAG_FILE"
