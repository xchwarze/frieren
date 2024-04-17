#!/bin/sh

# External configurations and paths
LOG_FILE="/tmp/diagnostics_output.log"
STATUS_LOG="/tmp/diagnostics_status.log"
DONE_FLAG="/tmp/diagnostics_done.flag"

# Append a status message to the status log
appendStatusMessage() {
    echo "$1" >> "$STATUS_LOG"
}

# Initialize diagnostics by cleaning up previous files and logging start
initializeDiagnostics() {
    rm -f "$LOG_FILE" "$STATUS_LOG" "$DONE_FLAG"
    appendStatusMessage "[*] Starting diagnostics collection"
}

# Add a section to the diagnostics log
addDiagnosticSection() {
    local title="$1"
    local command="$2"

    printf "=====>>> %s START <<<=====\n" "$title" >> "$LOG_FILE"
    eval "$command" >> "$LOG_FILE"
    printf "=====>>> %s END <<<=====\n\n" "$title" >> "$LOG_FILE"
}

# Collect system and kernel logs
collectLogs() {
    appendStatusMessage "[*] Collecting system and kernel logs"
    addDiagnosticSection "KERNEL LOG" "dmesg"
    addDiagnosticSection "SYSTEM LOG" "logread"
}

# Collect system configurations
collectConfigurations() {
    appendStatusMessage "[*] Collecting system configurations"
    addDiagnosticSection "WIRELESS CONFIG" "cat /etc/config/wireless"
    addDiagnosticSection "NETWORK CONFIG" "cat /etc/config/network"
    addDiagnosticSection "FIREWALL CONFIG" "cat /etc/config/firewall"
}

# Collect additional system information
collectSystemInfo() {
    appendStatusMessage "[*] Collecting additional system information"
    addDiagnosticSection "WIRELESS DEVICES" "iw dev"
    addDiagnosticSection "WIRELESS CONFIGURATION" "iwconfig"
    addDiagnosticSection "NETWORK INTERFACES" "ifconfig -a"
    addDiagnosticSection "CPU" "cat /proc/cpuinfo"
    addDiagnosticSection "MEMORY" "cat /proc/meminfo"
}

# Finalize diagnostics by setting a completion flag
finalizeDiagnostics() {
    appendStatusMessage "[*] Diagnostics collection completed"
    touch "$DONE_FLAG"
}

# Run the diagnostic process
runDiagnostics() {
    initializeDiagnostics
    collectLogs
    collectConfigurations
    collectSystemInfo
    finalizeDiagnostics
}

# Execute diagnostics
runDiagnostics
