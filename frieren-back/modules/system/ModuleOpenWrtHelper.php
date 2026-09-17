<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\system;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const SYSTEM_LOGS_LIMIT = 1000;
    const INIT_DIR = '/etc/init.d';

    /**
     * Services whose loss can lock the operator out of the device (LAN, SSH,
     * web UI, firewall). Every known role-equivalent init.d script name is
     * listed because which implementation a build ships varies by router:
     * dropbear vs openssh, uhttpd vs nginx/lighttpd. The nftables-based
     * `firewall4` package still installs its init script as `firewall`, so
     * no separate entry is needed for it.
     */
    const CRITICAL_SERVICES = [
        'network',
        'dropbear',
        'sshd',
        'uhttpd',
        'nginx',
        'lighttpd',
        'firewall',
    ];

    /**
     * Get the list of USB devices connected to the system.
     *
     * @return array|false An array of USB device objects, or `false` if the command fails.
     */
    public static function getUsbDevices()
    {
        $output = OpenWrtHelper::exec('lsusb', false);
        if (!$output) {
            return false;
        }

        $devices = [];
        foreach ($output as $line) {
            if (preg_match('/Bus (\d{3}) Device (\d{3}): ID (\w{4}:\w{4}) (.+)/', $line, $matches)) {
                $devices[] = [
                    'bus'    => $matches[1],
                    'device' => $matches[2],
                    'id'     => $matches[3],
                    'name'   => $matches[4],
                ];
            }
        }

        return $devices;
    }

    /**
     * Retrieves and parses the file system usage information.
     *
     * @return array|false Array containing filesystem usage information or false if an error occurs.
     */
    public static function getFileSystemUsage()
    {
        $output = OpenWrtHelper::exec('df -T -h', false);
        if (!$output) {
            return false;
        }

        array_shift($output);
        $devices = [];
        foreach ($output as $line) {
            $parts = preg_split('/\s+/', $line);
            if (count($parts) === 7) {
                $devices[] = [
                    'filesystem' => $parts[0],
                    'type'       => $parts[1],
                    'size'       => $parts[2],
                    'used'       => $parts[3],
                    'available'  => $parts[4],
                    'usePercent' => $parts[5],
                    'mountedOn'  => $parts[6],
                ];
            }
        }

        return $devices;
    }

    /**
     * Get the system log entries with optional search filtering.
     *
     * @param string|null $searchPattern Optional regex pattern to filter log messages.
     * @return array|false Array of log entries, or false if an error occurs
     */
    public static function getSystemLogs($searchPattern = null)
    {
        $command = 'logread -l ' . self::SYSTEM_LOGS_LIMIT;
        if ($searchPattern) {
            $command .= ' -e ' . escapeshellarg($searchPattern);
        }

        // $raw=true: $searchPattern is already escapeshellarg()'d above; running the whole
        // command through escapeshellcmd() too would additionally backslash-escape shell
        // metacharacters *inside* that already-quoted segment, corrupting the search term.
        // exec() returns [] (not false) for a search that legitimately matches zero lines —
        // only a real command failure returns false, so check for that explicitly instead of
        // treating an empty array as falsy.
        $output = OpenWrtHelper::exec($command, false, true);
        if ($output === false) {
            return false;
        }

        $logs = [];
        foreach ($output as $line) {
            if (preg_match('/^(.{24}) (\S+) (\S+): (.+)$/', $line, $matches)) {
                // logread emits its own ctime-style, English-only string with no timezone --
                // send an epoch instead so the frontend renders it in the viewer's own
                // locale/timezone rather than echoing the device's raw clock format.
                $epoch = strtotime($matches[1]);
                $logs[] = [
                    'timestamp' => $epoch !== false ? $epoch : null,
                    'tag'       => $matches[2],
                    'process'   => $matches[3],
                    'message'   => $matches[4],
                ];
            }
        }

        return array_reverse($logs);
    }

    /**
     * Confirms a service name maps to a real init script. Caller must have
     * already whitelisted the name against the regex; this guards the exec.
     *
     * @param string $name init.d script name.
     * @return bool
     */
    public static function serviceExists($name)
    {
        return is_file(self::INIT_DIR . '/' . $name);
    }

    /**
     * Lists every init.d service with its enabled (boot) and running state,
     * sorted by name.
     *
     * @return array<int, array{name:string, enabled:bool, running:bool, critical:bool}>
     */
    public static function listServices()
    {
        $entries = @scandir(self::INIT_DIR);
        if ($entries === false) {
            return [];
        }

        $running = self::runningServiceSet();
        $enabled = self::enabledServiceSet();
        $names = array_diff($entries, ['.', '..']);
        sort($names);

        $services = [];
        foreach ($names as $name) {
            if (!self::serviceExists($name)) {
                continue;
            }

            $services[] = [
                'name' => $name,
                'enabled' => isset($enabled[$name]),
                'running' => isset($running[$name]),
                'critical' => in_array($name, self::CRITICAL_SERVICES, true),
            ];
        }

        return $services;
    }

    /**
     * Returns the {enabled, running} state for a single service.
     *
     * @param string $name init.d script name.
     * @return array{enabled:bool, running:bool}
     */
    public static function serviceState($name)
    {
        $running = self::runningServiceSet();
        $enabled = self::enabledServiceSet();

        return [
            'enabled' => isset($enabled[$name]),
            'running' => isset($running[$name]),
        ];
    }

    /**
     * Runs a control verb (start|stop|restart) against a service.
     *
     * @param string $name init.d script name (already whitelisted).
     * @param string $command One of start|stop|restart.
     * @return bool True if the command exited 0.
     */
    public static function controlService($name, $command)
    {
        return OpenWrtHelper::exec(self::INIT_DIR . "/{$name} {$command}") !== false;
    }

    /**
     * Enables or disables a service on boot.
     *
     * @param string $name init.d script name (already whitelisted).
     * @param bool $enabled Desired boot state.
     * @return bool True if the command exited 0.
     */
    public static function setServiceEnabled($name, $enabled)
    {
        $command = $enabled ? 'enable' : 'disable';

        return OpenWrtHelper::exec(self::INIT_DIR . "/{$name} {$command}") !== false;
    }

    /**
     * Set of boot-enabled services, keyed by name. A service is enabled when it
     * has an rc.d start symlink (/etc/rc.d/S<NN><name>) — the same condition
     * `/etc/init.d/<svc> enabled` checks, resolved with a single glob instead
     * of one shell fork per service.
     *
     * @return array<string, bool>
     */
    private static function enabledServiceSet()
    {
        $enabled = [];
        foreach (glob('/etc/rc.d/S*') ?: [] as $link) {
            $name = preg_replace('/^S\d+/', '', basename($link));
            if ($name !== '') {
                $enabled[$name] = true;
            }
        }

        return $enabled;
    }

    /**
     * Set of currently running services, keyed by name, from procd.
     *
     * @return array<string, bool>
     */
    private static function runningServiceSet()
    {
        $list = OpenWrtHelper::execUbusCall('service', 'list');
        if (!is_array($list)) {
            return [];
        }

        return array_fill_keys(array_keys($list), true);
    }
}
