<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\dashboard;

class ModuleOpenWrtHelper
{
    const SYSTEM_LOAD_SCALE_FACTOR = 65536;

    /**
     * Fetches and returns system board info via ubus, or false on JSON error.
     *
     * @return array|false Parsed system board info or false.
     */
    public static function getUbusSystemBoard()
    {
        return \frieren\helper\OpenWrtHelper::execUbusCall('system', 'board');
    }

    /**
     * Fetches and returns system info via ubus, or false on JSON error.
     *
     * @return array|false Parsed system board info or false.
     */
    public static function getUbusSystemInfo()
    {
        $resume = \frieren\helper\OpenWrtHelper::execUbusCall('system', 'info');
        if (!$resume) {
            return false;
        }

        $totalCores = 0;
        $handle = fopen('/proc/stat', 'r');
        while (($line = fgets($handle)) !== false) {
            if ($line[0] === 'c' && $line[1] === 'p' && $line[2] === 'u' && $line[3] >= '0' && $line[3] <= '9') {
                $totalCores++;
            } else if ($totalCores > 0) {
                break;
            }
        }
        fclose($handle);

        $loadPercentage = ($resume['load'][0] / self::SYSTEM_LOAD_SCALE_FACTOR) / $totalCores * 100;
        $swapTotal = $resume['swap']['total'];
        $swapUsed = $swapTotal - $resume['swap']['free'];
        $memTotal = $resume['memory']['total'];
        $memUsed = $memTotal - $resume['memory']['free'] - $resume['memory']['buffered'] - $resume['memory']['cached'];

        return [
            'cpu_cores' => $totalCores,
            'cpu_usage' => min(round($loadPercentage, 1), 100) . '%',
            'memory_used' => ($memTotal > 0 ? round(($memUsed / $memTotal) * 100, 2) : 0) . '%',
            'swap_used' => ($swapTotal > 0 ? round(($swapUsed / $swapTotal) * 100, 2) : 0) . '%',
            'uptime' => self::secondsToUptime($resume['uptime']),
            'localtime' => date('Y-m-d H:i:s', $resume['localtime']),
        ];
    }

    /**
     * Retrieves and calculates memory usage information.
     *
     * @return array Memory info with total, used, and free memory in MB.
     */
    public static function getMemoryInfo() {
        $validType = ['MemTotal' => true, 'MemFree' => true, 'Buffers' => true, 'Cached' => true];
        $memoryInfo = [];

        $handle = fopen('/proc/meminfo', 'r');
        while (($line = fgets($handle)) !== false && count($memoryInfo) < 4) {
            list($key, $val) = explode(':', $line, 2);
            if (isset($validType[$key])) {
                $memoryInfo[$key] = (int)$val;
            }
        }
        fclose($handle);

        // I understand that for a more accurate calculation this would be the correct way to get this data for real
        $memUsed = $memoryInfo['MemTotal'] - $memoryInfo['MemFree'] - $memoryInfo['Buffers'] - $memoryInfo['Cached'];

        return [
            'total' => self::sizeToHuman($memoryInfo['MemTotal']),
            'free' => self::sizeToHuman($memoryInfo['MemFree']),
            'used' => self::sizeToHuman($memUsed),
        ];
    }

    /**
     * Calculates and formats system uptime into a human-readable string.
     *
     * @return string Uptime in days, hours, and minutes, or "less than 1 minute".
     */
    public static function getUptime()
    {
        $seconds = intval(explode('.', file_get_contents('/proc/uptime'))[0]);

        return self::secondsToUptime($seconds);
    }

    /**
     * Converts kilobytes to a human-readable format with appropriate unit.
     *
     * @param int $size The amount in kilobytes or bytes.
     * @param bool $isBytes Specifies if the input size is in bytes or kilobytes.
     * @return string Formatted size in KB, MB, or GB.
     */
    public static function sizeToHuman($size, $isBytes = false)
    {
        if ($isBytes) {
            $size /= 1024;
        }

        $units = ['KB', 'MB', 'GB'];
        for ($i = 0; $size >= 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }

        return sprintf("%.2f %s", $size, $units[$i]);
    }

    /**
     * Converts seconds into a formatted uptime string.
     *
     * @param int $seconds Seconds to convert.
     * @return string Formatted uptime.
     */
    public static function secondsToUptime($seconds)
    {
        $days = floor($seconds / 86400);
        $hours = floor(($seconds % 86400) / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        if ($days > 0) {
            return sprintf("%dd %02d:%02d hrs", $days, $hours, $minutes);
        } else if ($hours > 0 || $minutes > 0) {
            return sprintf("%02d:%02d hrs", $hours, $minutes);
        } else {
            return sprintf("%d sec", $seconds);
        }
    }
}
