<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\dashboard;

class DashboardController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getSystemResume',
        'getSystemStats'
    ];

    public function getSystemResume()
    {
        $resume = self::setupModuleHelper()::getUbusSystemBoard();
        if ($resume) {
            return self::setSuccess($resume);
        }

        self::setError();
    }

    public function getSystemStats()
    {
        $resume = self::setupModuleHelper()::getUbusSystemInfo();
        if ($resume) {
            $memory_used_pct = @round(($resume['memory_used'] / $resume['memory_total']) * 100, 2);
            $swap_used_pct = @round(($resume['swap_used'] / $resume['swap_total']) * 100, 2);

            return self::setSuccess([
                'cpu_cores' => $resume['total_cores'],
                'cpu_usage' => $resume['load'] . '%',
                'memory_used' =>  is_nan($memory_used_pct) ? '0%' : $memory_used_pct . '%',
                'swap_used' => is_nan($swap_used_pct) ? '0%' : $swap_used_pct . '%',
                'uptime' => $resume['uptime'],
                'localtime' => $resume['localtime'],
            ]);
        }

        self::setError();
    }
}
