<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\demo;

/**
 * Helper class for the OpenWrt platform.
 *
 * the idea behind this whole mechanism of helpers per platform is that the same module can be supported by different platforms.
 */
class ModuleOpenWrtHelper
{
    const SYSTEM_LOAD_SCALE_FACTOR = 65536;

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
