#!/bin/bash
set -euo pipefail
trap 'echo "ERROR: failed at line $LINENO" >&2' ERR
#
# Deploy frieren to device via SSH/SCP
# Usage: ./deploy.sh <service> [host] [password]
#        ./deploy.sh module <name> <src-path> [host] [password]
#   service   - "back", "front", "terminal" or "module"
#   name      - module name (module mode only)
#   src-path  - local path to the module sources; built with yarn before upload (module mode only)
#   host      - default: 192.168.7.1
#   password  - default: root

SERVICE="${1:-}"
if [ "$SERVICE" = "module" ]; then
    MODULE_NAME="${2:-}"
    MODULE_SRC_PATH="${3:-}"
    HOST="${4:-192.168.7.1}"
    PASS="${5:-root}"
else
    HOST="${2:-192.168.7.1}"
    PASS="${3:-root}"
fi
USER="root"
REMOTE_PATH="/usr/share/frieren"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACK_PATH="$(cd "${SCRIPT_DIR}/../frieren-back" && pwd)"
FRONT_PATH="$(cd "${SCRIPT_DIR}/../frieren-front" && pwd)"
TERMINAL_PATH="$(cd "${SCRIPT_DIR}/../frieren-terminal" && pwd)"

ssh-keygen -R "${HOST}" 2>/dev/null || true

if [ -z "$SERVICE" ] || { [ "$SERVICE" != "back" ] && [ "$SERVICE" != "front" ] && [ "$SERVICE" != "terminal" ] && [ "$SERVICE" != "module" ]; }; then
    echo "Usage: $0 <back|front|terminal> [host] [password]"
    echo "       $0 module <name> <src-path> [host] [password]"
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
    echo "[+] Deploying backend -> ${USER}@${HOST}:${REMOTE_PATH}"

    # api/ core files
    scp_with_pass "${PASS}" "${BACK_PATH}/api/index.php" "${USER}@${HOST}:${REMOTE_PATH}/api/"
    for dir in core helper orm; do
        scp_with_pass "${PASS}" -r "${BACK_PATH}/api/${dir}" "${USER}@${HOST}:${REMOTE_PATH}/api/"
    done

    # modules/
    scp_with_pass "${PASS}" -r "${BACK_PATH}/modules" "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "[*] Backend deployed."
}

build_terminal() {
    echo "[+] Building terminal library..."
    cd "${TERMINAL_PATH}"
    yarn build
    echo "[*] Terminal library built."
}

deploy_front() {
    echo "[+] Building frontend..."
    cd "${FRONT_PATH}"
    yarn build --mode release

    echo "[+] Deploying frontend -> ${USER}@${HOST}:${REMOTE_PATH}"
    scp_with_pass "${PASS}" -r "${FRONT_PATH}/dist/"* "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "[*] Frontend deployed."
}

deploy_module() {
    if [ -z "$MODULE_NAME" ] || [ -z "$MODULE_SRC_PATH" ]; then
        echo "Usage: $0 module <name> <src-path> [host] [password]"
        exit 1
    fi
    if [ ! -d "$MODULE_SRC_PATH" ]; then
        echo "Module source path not found: ${MODULE_SRC_PATH}"
        exit 1
    fi

    echo "[+] Building module '${MODULE_NAME}'..."
    cd "${MODULE_SRC_PATH}"
    yarn build --mode release

    local remoteModulePath="${REMOTE_PATH}/modules/${MODULE_NAME}"
    echo "[+] Deploying module '${MODULE_NAME}' -> ${USER}@${HOST}:${remoteModulePath}"

    ssh_with_pass "${PASS}" "${USER}@${HOST}" "mkdir -p '${remoteModulePath}'"
    scp_with_pass "${PASS}" -r "dist/"* "${USER}@${HOST}:${remoteModulePath}/"

    echo "[*] Module '${MODULE_NAME}' deployed."
}

case "$SERVICE" in
    back)     deploy_back ;;
    front)    deploy_front ;;
    terminal) build_terminal ;;
    module)   deploy_module ;;
esac
