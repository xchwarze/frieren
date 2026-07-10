<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\network;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const DHCP_LEASES_FILE = '/tmp/dhcp.leases';

    /**
     * Runs a bounded ICMP ping against the given host.
     *
     * @param string $host Already whitelisted hostname or IP.
     * @return string Raw command output (or 'No response' on failure).
     */
    public static function runPing($host)
    {
        $output = OpenWrtHelper::exec('ping -c 5 -W 2 ' . escapeshellarg($host));

        return $output !== false ? $output : 'No response';
    }

    /**
     * Runs a traceroute against the given host.
     *
     * @param string $host Already whitelisted hostname or IP.
     * @return string Raw command output (or 'No response' on failure).
     */
    public static function runTraceroute($host)
    {
        // Bound it: 1 probe/hop, 1s wait, max 15 hops — an unbounded traceroute
        // blocks long enough to trip the web-server upstream timeout (502).
        $output = OpenWrtHelper::exec('traceroute -q 1 -w 1 -m 15 ' . escapeshellarg($host));

        return $output !== false ? $output : 'No response';
    }

    /**
     * Resolves the given host via nslookup.
     *
     * @param string $host Already whitelisted hostname or IP.
     * @return string Raw command output (or 'No response' on failure).
     */
    public static function runNslookup($host)
    {
        $output = OpenWrtHelper::exec('nslookup ' . escapeshellarg($host));

        return $output !== false ? $output : 'No response';
    }

    /**
     * Parses the ARP/neighbor table from `ip neigh`.
     *
     * @return array<int, array{ip:string, mac:string, device:string, state:string}>
     */
    public static function getArpTable()
    {
        $output = OpenWrtHelper::exec('ip neigh', false);
        if (!is_array($output)) {
            return [];
        }

        $neighbors = [];
        foreach ($output as $line) {
            // e.g. "192.168.1.5 dev br-lan lladdr aa:bb:cc:dd:ee:ff REACHABLE"
            if (!preg_match('/^(\S+)\s+dev\s+(\S+)/', $line, $head)) {
                continue;
            }

            $mac = '';
            if (preg_match('/lladdr\s+(\S+)/', $line, $macMatch)) {
                $mac = $macMatch[1];
            }

            $state = '';
            if (preg_match('/\s(\S+)\s*$/', $line, $stateMatch)) {
                $state = $stateMatch[1];
            }

            $neighbors[] = [
                'ip' => $head[1],
                'mac' => $mac,
                'device' => $head[2],
                'state' => $state,
            ];
        }

        return $neighbors;
    }

    /**
     * Parses active DHCP leases from /tmp/dhcp.leases.
     *
     * @return array<int, array{hostname:string, ip:string, mac:string, expires:int}>
     */
    public static function getDhcpLeases()
    {
        if (!file_exists(self::DHCP_LEASES_FILE)) {
            return [];
        }

        $lines = file(self::DHCP_LEASES_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return [];
        }

        $leases = [];
        foreach ($lines as $line) {
            // <epoch> <mac> <ip> <hostname> <clientid>
            $parts = preg_split('/\s+/', trim($line));
            if (count($parts) < 4) {
                continue;
            }

            $hostname = $parts[3];
            $leases[] = [
                'hostname' => $hostname === '*' ? '' : $hostname,
                'ip' => $parts[2],
                'mac' => $parts[1],
                'expires' => (int)$parts[0],
            ];
        }

        return $leases;
    }

    /**
     * Checks whether a static lease already exists for the given MAC.
     *
     * @param string $mac Already validated MAC address.
     * @return bool
     */
    public static function staticLeaseExists($mac)
    {
        foreach (self::readDhcpHosts() as $host) {
            if (isset($host['mac']) && strcasecmp($host['mac'], $mac) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Lists configured static leases (UCI dhcp `host` sections).
     *
     * @return array<int, array{name:string, mac:string, ip:string}>
     */
    public static function getStaticLeases()
    {
        $hosts = self::readDhcpHosts();

        $leases = [];
        foreach ($hosts as $host) {
            $leases[] = [
                'name' => $host['name'] ?? '',
                'mac' => $host['mac'] ?? '',
                'ip' => $host['ip'] ?? '',
            ];
        }

        return $leases;
    }

    /**
     * Adds a static lease as a new UCI dhcp `host` section and reloads dnsmasq.
     *
     * @param string $name Already validated lease name.
     * @param string $mac Already validated MAC address.
     * @param string $ip Already validated IPv4 address.
     * @return bool True on success.
     */
    public static function addStaticLease($name, $mac, $ip)
    {
        $section = OpenWrtHelper::exec('uci add dhcp host', true, true);
        if ($section === false || $section === '') {
            return false;
        }

        OpenWrtHelper::uciSet("dhcp.{$section}.name", $name, false, false);
        OpenWrtHelper::uciSet("dhcp.{$section}.mac", $mac, false, false);
        OpenWrtHelper::uciSet("dhcp.{$section}.ip", $ip, false, false);
        OpenWrtHelper::uciCommit();

        OpenWrtHelper::exec('/etc/init.d/dnsmasq reload');

        return true;
    }

    /**
     * Removes the static lease whose MAC matches and reloads dnsmasq.
     *
     * @param string $mac Already validated MAC address.
     * @return bool True if a matching host section was found and removed.
     */
    public static function deleteStaticLease($mac)
    {
        $hosts = self::readDhcpHosts();

        $sectionId = null;
        foreach ($hosts as $id => $host) {
            if (isset($host['mac']) && strcasecmp($host['mac'], $mac) === 0) {
                $sectionId = $id;
                break;
            }
        }

        if ($sectionId === null) {
            return false;
        }

        // Delete by the section's real uci id (named or anonymous cfgXXXXXX), so
        // this stays correct regardless of named/anonymous section ordering.
        // raw=true: escapeshellarg already quotes; skip escapeshellcmd.
        $deleted = OpenWrtHelper::exec('uci delete ' . escapeshellarg("dhcp.{$sectionId}"), true, true);
        if ($deleted === false) {
            return false;
        }

        OpenWrtHelper::uciCommit();
        OpenWrtHelper::exec('/etc/init.d/dnsmasq reload');

        return true;
    }

    /**
     * Lists configured network interfaces merged with live ubus status.
     * Skips the 'loopback' interface.
     *
     * @return array<int, array{name:string, proto:string, up:bool, ipaddr:?string, netmask:?string, gateway:?string, dns:array, uptime:int, device:?string}>
     */
    public static function getInterfaces()
    {
        // Enumerate interfaces from the live ubus dump (real names: lan/wan/...).
        // The UCI file parser keys quoted `config interface 'lan'` sections
        // anonymously, so we read per-interface config via `uci get <name>.<opt>`
        // (the CLI resolves quoted section names correctly).
        $live = self::interfaceLiveStatus();

        // Read the whole network config in ONE file parse (0 forks) instead of
        // forking `uci get` per field. Interface sections are always named
        // (config interface 'lan'), so the parser keys them by real name and
        // returns list options (dns) as arrays.
        try {
            $uciSections = OpenWrtHelper::uciReadConfig('network');
        } catch (\Exception $e) {
            $uciSections = [];
        }

        $interfaces = [];
        foreach ($live as $name => $status) {
            if ($name === 'loopback') {
                continue;
            }

            $ipv4 = (isset($status['ipv4-address'][0]) && is_array($status['ipv4-address'][0]))
                ? $status['ipv4-address'][0]
                : [];

            $uci = $uciSections[$name] ?? [];

            $interfaces[] = [
                'name' => $name,
                'proto' => $status['proto'] ?? ($uci['proto'] ?? ''),
                'up' => isset($status['up']) ? (bool)$status['up'] : false,
                'ipaddr' => $ipv4['address'] ?? ($uci['ipaddr'] ?? null),
                'netmask' => isset($ipv4['mask'])
                    ? self::cidrToNetmask($ipv4['mask'])
                    : ($uci['netmask'] ?? null),
                'gateway' => $uci['gateway'] ?? null,
                'dns' => self::normalizeList($uci['dns'] ?? null),
                'uptime' => isset($status['uptime']) ? (int)$status['uptime'] : 0,
                'device' => $status['l3_device'] ?? ($status['device'] ?? null),
            ];
        }

        return $interfaces;
    }

    /**
     * Confirms a named interface section exists in /etc/config/network.
     *
     * @param string $name Already whitelisted interface name.
     * @return bool
     */
    public static function interfaceExists($name)
    {
        return OpenWrtHelper::uciGet("network.{$name}", false) !== null;
    }

    /**
     * Writes the L3 config of an interface to /etc/config/network and reloads.
     * On `dhcp` the static address fields are cleared/ignored.
     *
     * @param string $name Already validated interface name (section exists).
     * @param string $proto 'static' or 'dhcp'.
     * @param string $ipaddr Validated IPv4 (static only).
     * @param string $netmask Validated IPv4 mask (static only).
     * @param string $gateway Validated IPv4 gateway or '' (static only).
     * @param array $dns Validated IPv4 DNS servers (static only).
     * @return bool True on success.
     */
    public static function setInterface($name, $proto, $ipaddr, $netmask, $gateway, $dns)
    {
        OpenWrtHelper::uciSet("network.{$name}.proto", $proto, false, false);

        if ($proto === 'static') {
            OpenWrtHelper::uciSet("network.{$name}.ipaddr", $ipaddr, false, false);
            OpenWrtHelper::uciSet("network.{$name}.netmask", $netmask, false, false);

            // Gateway is optional: delete the option when empty rather than writing
            // the framework's 'UNSET' sentinel, which netifd would read literally.
            if ($gateway === '') {
                OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.gateway"));
            } else {
                OpenWrtHelper::uciSet("network.{$name}.gateway", $gateway, false, false);
            }

            // Replace the dns list entirely.
            OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.dns"));
            if (is_array($dns)) {
                foreach ($dns as $server) {
                    OpenWrtHelper::uciSet("network.{$name}.dns", $server, true, false);
                }
            }
        } else {
            // dhcp: drop static-only fields so they do not linger.
            OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.ipaddr"));
            OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.netmask"));
            OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.gateway"));
            OpenWrtHelper::exec('uci -q delete ' . escapeshellarg("network.{$name}.dns"));
        }

        OpenWrtHelper::uciCommit();
        OpenWrtHelper::execUbusCall('network', 'reload');

        return true;
    }

    /**
     * Brings an interface up or down via ubus (never touches wireless `disabled`).
     *
     * @param string $name Already validated interface name.
     * @param string $action 'up' or 'down'.
     * @return bool True on success.
     */
    public static function toggleInterface($name, $action)
    {
        // ubus up/down emit no output on success, so execUbusCall (which needs
        // valid JSON back) would misreport failure. Use a plain exec + exit code.
        return OpenWrtHelper::exec("ubus call network.interface.{$name} {$action}") !== false;
    }

    /**
     * Reads the UCI dhcp `host` sections (anonymous @host[i]) in order.
     *
     * @return array<int, array<string, mixed>> host sections indexed 0..n.
     */
    private static function readDhcpHosts()
    {
        // Read dhcp via ubus so every `host` section carries its real uci id
        // (named section name, or anonymous cfgXXXXXX) and its .type. The file
        // parser can't do this: it drops the section type and keys named
        // sections by name, so a named `config host` would be missed AND the
        // anonymous @host[i] indices would no longer line up with uci's own
        // numbering — deleting by that index removes the wrong lease.
        $sections = OpenWrtHelper::uciGetConfig('dhcp');

        $hosts = [];
        foreach ($sections as $id => $section) {
            if (($section['.type'] ?? '') === 'host') {
                $hosts[$id] = $section;
            }
        }

        return $hosts;
    }

    /**
     * Fetches live interface status keyed by interface name via procd ubus
     * (network.interface dump). No luci-rpc dependency.
     *
     * @return array<string, array<string, mixed>>
     */
    private static function interfaceLiveStatus()
    {
        $dump = OpenWrtHelper::execUbusCall('network.interface', 'dump');
        if (!is_array($dump) || !isset($dump['interface']) || !is_array($dump['interface'])) {
            return [];
        }

        $status = [];
        foreach ($dump['interface'] as $entry) {
            if (isset($entry['interface'])) {
                $status[$entry['interface']] = $entry;
            }
        }

        return $status;
    }

    /**
     * Converts a CIDR prefix length to a dotted IPv4 netmask.
     *
     * @param int $bits Prefix length (0-32).
     * @return string Dotted netmask.
     */
    private static function cidrToNetmask($bits)
    {
        // Octet math (no 0xffffffff / long2ip) so it stays correct on 32-bit PHP
        // where 0xffffffff overflows int into float.
        $bits = max(0, min(32, (int)$bits));

        $octets = [];
        for ($i = 0; $i < 4; $i++) {
            $take = max(0, min(8, $bits - ($i * 8)));
            $octets[] = $take === 0 ? 0 : 256 - (1 << (8 - $take));
        }

        return implode('.', $octets);
    }

    /**
     * Normalizes a UCI value that may be a scalar or a list into an array.
     *
     * @param mixed $value
     * @return array
     */
    private static function normalizeList($value)
    {
        if (is_array($value)) {
            return array_values($value);
        }
        if ($value === null || $value === '') {
            return [];
        }

        return [$value];
    }
}
