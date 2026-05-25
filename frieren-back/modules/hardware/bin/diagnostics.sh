#!/bin/sh

# External configurations and paths
OUTPUT_FILE="/tmp/diagnostics_output.log"

# Initialize diagnostics by cleaning up previous output
initializeDiagnostics() {
    rm -f "$OUTPUT_FILE"
    echo "[*] Starting diagnostics collection"
}

# Add a section to the diagnostics output
addDiagnosticSection() {
    local title="$1"
    local command="$2"

    printf "=====>>> %s START <<<=====\n" "$title" >> "$OUTPUT_FILE"
    eval "$command" >> "$OUTPUT_FILE"
    printf "=====>>> %s END <<<=====\n\n" "$title" >> "$OUTPUT_FILE"
}

# Collect system and kernel logs
collectLogs() {
    echo "[*] Collecting system and kernel logs"
    addDiagnosticSection "KERNEL LOG" "dmesg"
    addDiagnosticSection "SYSTEM LOG" "logread"
}

# Collect system configurations
collectConfigurations() {
    echo "[*] Collecting system configurations"
    addDiagnosticSection "WIRELESS CONFIG" "cat /etc/config/wireless"
    addDiagnosticSection "NETWORK CONFIG" "cat /etc/config/network"
    addDiagnosticSection "FIREWALL CONFIG" "cat /etc/config/firewall"
}

# Collect additional system information
collectSystemInfo() {
    echo "[*] Collecting additional system information"
    addDiagnosticSection "WIRELESS DEVICES" "iw dev"
    addDiagnosticSection "WIRELESS CONFIGURATION" "iwconfig"
    addDiagnosticSection "NETWORK INTERFACES" "ifconfig -a"
    addDiagnosticSection "CPU" "cat /proc/cpuinfo"
    addDiagnosticSection "MEMORY" "cat /proc/meminfo"
}

# Run the diagnostic process
initializeDiagnostics
collectLogs
collectConfigurations
collectSystemInfo
echo "[*] Diagnostics collection completed"
