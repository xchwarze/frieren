#!/bin/sh

# Project: Frieren Framework
# Copyright (C) 2026 DSR! <xchwarze@gmail.com>
# SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0

UPDATE_URL="$1"
PACKAGE_PATH="/tmp/frieren-update.ipk"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$1] $2"
}

cleanup() {
    rm -f "$PACKAGE_PATH"
}

if [ -z "$UPDATE_URL" ]; then
    log "ERROR" "No update URL provided"
    exit 1
fi

log "INFO" "Downloading update from $UPDATE_URL"
/bin/uclient-fetch -q -T 30 -O "$PACKAGE_PATH" "$UPDATE_URL" 2>&1
if [ $? -ne 0 ] || [ ! -f "$PACKAGE_PATH" ]; then
    log "ERROR" "Download failed"
    cleanup
    exit 1
fi

log "INFO" "Installing update package"
opkg install --force-overwrite "$PACKAGE_PATH" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR" "Package installation failed"
    cleanup
    exit 1
fi

cleanup
log "INFO" "Installation complete, restarting services"

/etc/init.d/php8-fpm restart 2>&1
/etc/init.d/nginx restart 2>&1

log "INFO" "Update finished, rebooting in 3 seconds"
sleep 3
reboot
