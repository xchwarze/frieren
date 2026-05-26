#!/bin/bash
set -euo pipefail
trap 'echo "ERROR: failed at line $LINENO" >&2' ERR
#
# Deploy frieren to device via SSH/SCP
# Usage: ./deploy.sh <service> [host] [password]
#   service  - "back", "front" or "terminal"
#   host     - default: 192.168.7.1
#   password - default: root

SERVICE="${1:-}"
HOST="${2:-192.168.7.1}"
PASS="${3:-root}"
USER="root"
REMOTE_PATH="/usr/share/frieren"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACK_PATH="$(cd "${SCRIPT_DIR}/../frieren-back" && pwd)"
FRONT_PATH="$(cd "${SCRIPT_DIR}/../frieren-front" && pwd)"
TERMINAL_PATH="$(cd "${SCRIPT_DIR}/../frieren-terminal" && pwd)"

ssh-keygen -R "${HOST}" 2>/dev/null || true

if [ -z "$SERVICE" ] || { [ "$SERVICE" != "back" ] && [ "$SERVICE" != "front" ] && [ "$SERVICE" != "terminal" ]; }; then
    echo "Usage: $0 <back|front|terminal> [host] [password]"
    exit 1
fi

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
    DISPLAY=:0 SSH_ASKPASS="${ASKPASS_HELPER}" SSH_ASKPASS_REQUIRE=force scp -O -o StrictHostKeyChecking=no "$@"
}

deploy_back() {
    echo "Deploying backend -> ${USER}@${HOST}:${REMOTE_PATH}"

    # api/ core files
    scp_with_pass "${PASS}" "${BACK_PATH}/api/index.php" "${USER}@${HOST}:${REMOTE_PATH}/api/"
    for dir in core helper orm; do
        scp_with_pass "${PASS}" -r "${BACK_PATH}/api/${dir}" "${USER}@${HOST}:${REMOTE_PATH}/api/"
    done

    # modules/
    scp_with_pass "${PASS}" -r "${BACK_PATH}/modules" "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "Backend deployed."
}

build_terminal() {
    echo "Building terminal library..."
    cd "${TERMINAL_PATH}"
    yarn build
    echo "Terminal library built."
}

deploy_front() {
    build_terminal

    echo "Building frontend..."
    cd "${FRONT_PATH}"
    yarn build --mode release

    echo "Deploying frontend -> ${USER}@${HOST}:${REMOTE_PATH}"
    scp_with_pass "${PASS}" -r "${FRONT_PATH}/dist/"* "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "Frontend deployed."
}

case "$SERVICE" in
    back)     deploy_back ;;
    front)    deploy_front ;;
    terminal) build_terminal ;;
esac
