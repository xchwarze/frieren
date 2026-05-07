#!/bin/bash
#
# Deploy frieren-back to device via SSH/SCP
# Usage: ./deploy.sh [host] [password]
#   host     - default: 192.168.7.1
#   password - default: root

HOST="${1:-192.168.7.1}"
PASS="${2:-root}"
USER="root"
REMOTE_PATH="/usr/share/frieren"
LOCAL_PATH="$(cd "$(dirname "$0")/../frieren-back" && pwd)"

ASKPASS_HELPER=$(mktemp)
chmod +x "${ASKPASS_HELPER}"
trap 'rm -f "${ASKPASS_HELPER}"' EXIT

ssh_with_pass() {
    local password="$1"
    shift
    printf '#!/bin/sh\necho "%s"\n' "${password}" > "${ASKPASS_HELPER}"
    DISPLAY=:0 SSH_ASKPASS="${ASKPASS_HELPER}" SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no "$@"
}

scp_with_pass() {
    local password="$1"
    shift
    printf '#!/bin/sh\necho "%s"\n' "${password}" > "${ASKPASS_HELPER}"
    DISPLAY=:0 SSH_ASKPASS="${ASKPASS_HELPER}" SSH_ASKPASS_REQUIRE=force scp -o StrictHostKeyChecking=no "$@"
}

echo "Deploying ${LOCAL_PATH} -> ${USER}@${HOST}:${REMOTE_PATH}"

scp_with_pass "${PASS}" -r "${LOCAL_PATH}/api" "${USER}@${HOST}:${REMOTE_PATH}/"
scp_with_pass "${PASS}" -r "${LOCAL_PATH}/modules" "${USER}@${HOST}:${REMOTE_PATH}/"

echo "Done."
