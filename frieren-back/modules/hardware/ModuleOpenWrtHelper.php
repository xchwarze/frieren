<?php

namespace frieren\modules\hardware;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const SYSTEM_LOGS_LIMIT = 1000;

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

        $output = OpenWrtHelper::exec($command, false);
        if (!$output) {
            return false;
        }

        $logs = [];
        foreach ($output as $line) {
            if (preg_match('/^(.{24}) (\S+) (\S+): (.+)$/', $line, $matches)) {
                $logs[] = [
                    'timestamp' => $matches[1],
                    'tag'       => $matches[2],
                    'process'   => $matches[3],
                    'message'   => $matches[4],
                ];
            }
        }

        return array_reverse($logs);
    }
}
