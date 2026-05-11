<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\demo;

class DemoController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getSystemStats' => true,
    ];

    public function getSystemStats()
    {
        // the self::setupModuleHelper() method loads the module helper corresponding to the platform it is running on
        $resume = self::setupModuleHelper()::getUbusSystemInfo();
        if ($resume) {
            $memory_used_pct = $resume['memory_total'] > 0 ? round(($resume['memory_used'] / $resume['memory_total']) * 100, 2) : 0;
            $swap_used_pct = $resume['swap_total'] > 0 ? round(($resume['swap_used'] / $resume['swap_total']) * 100, 2) : 0;

            return self::setSuccess([
                'cpu_cores' => $resume['total_cores'],
                'cpu_usage' => $resume['load'] . '%',
                'memory_used' => $memory_used_pct . '%',
                'swap_used' => $swap_used_pct . '%',
                'uptime' => $resume['uptime'],
                'localtime' => $resume['localtime'],
            ]);
        }

        self::setError();
    }
}
