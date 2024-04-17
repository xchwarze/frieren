<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
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
        return \frieren\helper\OpenWrtHelper::execUbusCall('system board');
    }

    /**
     * Fetches and returns system info via ubus, or false on JSON error.
     *
     * @return array|false Parsed system board info or false.
     */
    public static function getUbusSystemInfo()
    {
        $resume = \frieren\helper\OpenWrtHelper::execUbusCall('system info');
        if (!$resume) {
            return false;
        }

        $data = file('/proc/stat');
        $totalCores = 0;
        foreach ($data as $line) {
            if (preg_match('/^cpu[0-9]+/', $line)) {
                $totalCores++;
            }
        }

        $loadPercentage = ($resume['load'][0] / self::SYSTEM_LOAD_SCALE_FACTOR) / $totalCores * 100;
        $swapUsed = $resume['swap']['total'] - $resume['swap']['free'];
        $memUsed = $resume['memory']['total'] - $resume['memory']['free'] - $resume['memory']['buffered'] - $resume['memory']['cached'];

        return [
            'total_cores' => $totalCores,
            'load' => min(round($loadPercentage, 1), 100),
            'swap_used' => $swapUsed,
            'swap_total' => $resume['swap']['total'],
            'memory_used' => $memUsed,
            'memory_total' => $resume['memory']['total'],
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
        $lines = file('/proc/meminfo');
        $validType = ['MemTotal', 'MemFree', 'Buffers', 'Cached'];
        $memoryInfo = [];

        foreach ($lines as $line) {
            list($key, $val) = explode(':', $line, 2);
            if (in_array($key, $validType)) {
                $memoryInfo[$key] = (int)trim(str_replace('kB', '', $val));
            }
        }

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
