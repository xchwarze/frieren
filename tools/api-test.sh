#!/bin/bash
set -euo pipefail
trap 'echo "ERROR: failed at line $LINENO" >&2' ERR
#
# Frieren API test helper
# Usage:
#   ./api-test.sh login                          # Login (required first)
#   ./api-test.sh req '{"module":"packages","action":"getInstalledPackages"}'
#   ./api-test.sh req '{"module":"packages","action":"getInstalledPackagesStatus"}'
#
# Options:
#   -h HOST      Device host (default: 192.168.7.1)
#   -p PORT      Device port (default: 5000)
#   -u USER      Username (default: root)
#   -w PASS      Password (default: root)
#   -o FILE      Save response to file instead of stdout
#   -t TIMEOUT   Curl timeout in seconds (default: 30)
#   -s SLEEP     Sleep N seconds before request (for polling)

HOST="192.168.7.1"
PORT="5000"
USER="root"
PASS="root"
COOKIE_JAR="/tmp/frieren-cookies.txt"
OUTPUT=""
TIMEOUT=30
SLEEP=0

while getopts "h:p:u:w:o:t:s:" opt; do
    case $opt in
        h) HOST="$OPTARG" ;;
        p) PORT="$OPTARG" ;;
        u) USER="$OPTARG" ;;
        w) PASS="$OPTARG" ;;
        o) OUTPUT="$OPTARG" ;;
        t) TIMEOUT="$OPTARG" ;;
        s) SLEEP="$OPTARG" ;;
        *) echo "Unknown option: -$opt" >&2; exit 1 ;;
    esac
done
shift $((OPTIND - 1))

BASE_URL="http://${HOST}:${PORT}/api/index.php"
ACTION="${1:-}"
PAYLOAD="${2:-}"

api_call() {
    local data="$1"
    local xsrf
    xsrf=$(grep XSRF-TOKEN "$COOKIE_JAR" 2>/dev/null | awk '{print $NF}' || true)

    local extra_args=()
    [ -n "$xsrf" ] && extra_args+=(-H "X-XSRF-TOKEN: $xsrf")
    [ -n "$OUTPUT" ] && extra_args+=(-o "$OUTPUT")

    curl -s \
        -c "$COOKIE_JAR" \
        -b "$COOKIE_JAR" \
        -X POST "$BASE_URL" \
        -H 'Content-Type: application/json' \
        --max-time "$TIMEOUT" \
        "${extra_args[@]}" \
        -d "$data"
}

case "$ACTION" in
    login)
        echo "Logging in to ${BASE_URL}..."
        api_call "{\"module\":\"login\",\"action\":\"login\",\"username\":\"${USER}\",\"password\":\"${PASS}\"}"
        echo ""
        ;;
    req)
        if [ -z "$PAYLOAD" ]; then
            echo "Usage: $0 req '{\"module\":\"...\",\"action\":\"...\"}'" >&2
            exit 1
        fi
        [ "$SLEEP" -gt 0 ] && sleep "$SLEEP"
        api_call "$PAYLOAD"
        echo ""
        ;;
    *)
        echo "Usage: $0 {login|req} [json_payload]" >&2
        echo ""
        echo "Examples:" >&2
        echo "  $0 login" >&2
        echo "  $0 req '{\"module\":\"packages\",\"action\":\"getInstalledPackages\"}'" >&2
        echo "  $0 -s 5 req '{\"module\":\"packages\",\"action\":\"getInstalledPackagesStatus\"}'" >&2
        echo "  $0 -o /tmp/result.json req '{\"module\":\"packages\",\"action\":\"getAvailablePackagesStatus\"}'" >&2
        exit 1
        ;;
esac
