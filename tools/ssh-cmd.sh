#!/bin/bash
set -euo pipefail
trap 'echo "ERROR: failed at line $LINENO" >&2' ERR
#
# Run a command on the device via SSH
# Usage: ./ssh-cmd.sh <command> [host] [password]
#   command  - command to execute on device
#   host     - default: 192.168.7.1
#   password - default: root

CMD="${1:-}"
HOST="${2:-192.168.7.1}"
PASS="${3:-root}"
USER="root"

ssh-keygen -R "${HOST}" 2>/dev/null || true

if [ -z "$CMD" ]; then
    echo "Usage: $0 <command> [host] [password]"
    exit 1
fi

ASKPASS_HELPER=$(mktemp)
chmod +x "${ASKPASS_HELPER}"
trap 'rm -f "${ASKPASS_HELPER}"' EXIT

printf '#!/bin/sh\necho "%s"\n' "${PASS}" > "${ASKPASS_HELPER}"
DISPLAY=:0 SSH_ASKPASS="${ASKPASS_HELPER}" SSH_ASKPASS_REQUIRE=force ssh -o StrictHostKeyChecking=no "${USER}@${HOST}" "${CMD}"
