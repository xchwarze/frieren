#!/bin/sh

# Installs module dependencies, streaming the package-manager output straight to
# stdout (no buffering) so BackgroundTaskHelper captures it line by line and the
# UI can show progress in real time. Unlike package-manager-call.sh this does NOT
# wrap the result in JSON — it favours a live log over a structured result.
#
# Usage: dependency-installer.sh [--dest <target>] <dep1> [dep2 ...]

DEST=""

if [ -f /usr/bin/apk ]; then
    PM="apk"
    INSTALL="add"
else
    PM="opkg"
    INSTALL="install"
fi

while [ "$#" -gt 0 ]; do
    case "$1" in
        --dest)
            # apk has no per-destination install; only opkg honours --dest
            [ "$PM" = "opkg" ] && DEST="--dest $2"
            shift 2
        ;;
        *)
            break
        ;;
    esac
done

DEPS="$@"

if [ -z "$DEPS" ]; then
    echo "No dependencies specified."
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

(
    flock -x 200

    log "Updating package lists..."
    $PM update 2>&1

    log "Installing: $DEPS"
    $PM $DEST $INSTALL $DEPS 2>&1
    code=$?

    log "Finished with exit code $code."
) 200>/tmp/ipkg.lock
