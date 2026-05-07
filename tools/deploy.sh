#!/bin/bash
#
# Deploy frieren to device via SSH/SCP
# Usage: ./deploy.sh <service> [host] [password]
#   service  - "back" or "front"
#   host     - default: 192.168.7.1
#   password - default: root

SERVICE="$1"
HOST="${2:-192.168.7.1}"
PASS="${3:-root}"
USER="root"
REMOTE_PATH="/usr/share/frieren"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACK_PATH="$(cd "${SCRIPT_DIR}/../frieren-back" && pwd)"
FRONT_PATH="$(cd "${SCRIPT_DIR}/../frieren-front" && pwd)"

if [ -z "$SERVICE" ] || { [ "$SERVICE" != "back" ] && [ "$SERVICE" != "front" ]; }; then
    echo "Usage: $0 <back|front> [host] [password]"
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
    DISPLAY=:0 SSH_ASKPASS="${ASKPASS_HELPER}" SSH_ASKPASS_REQUIRE=force scp -o StrictHostKeyChecking=no "$@"
}

deploy_back() {
    echo "Deploying backend -> ${USER}@${HOST}:${REMOTE_PATH}"

    # api/ without index.php and config/
    for dir in core helper orm; do
        scp_with_pass "${PASS}" -r "${BACK_PATH}/api/${dir}" "${USER}@${HOST}:${REMOTE_PATH}/api/"
    done

    # modules/
    scp_with_pass "${PASS}" -r "${BACK_PATH}/modules" "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "Backend deployed."
}

deploy_front() {
    echo "Building frontend..."
    cd "${FRONT_PATH}"
    cp config/.env.prod .env
    yarn build

    echo "Preparing compressed assets..."
    cd "${FRONT_PATH}/dist/assets"
    rm -f *.js *.css
    mv index.js.gz index.js
    mv index.css.gz index.css

    echo "Deploying frontend -> ${USER}@${HOST}:${REMOTE_PATH}"
    scp_with_pass "${PASS}" -r "${FRONT_PATH}/dist/"* "${USER}@${HOST}:${REMOTE_PATH}/"

    echo "Frontend deployed."
}

if [ "$SERVICE" = "back" ]; then
    deploy_back
else
    deploy_front
fi
