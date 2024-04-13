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
            return self::setSuccess([
                'cpu_cores' => 1,
                'cpu_usage' => $resume['load'] . '%',
                'memory_used' => round(($resume['memory_used'] / $resume['memory_total']) * 100) . '%',
                'swap_used' => round(($resume['swap_used'] / $resume['swap_total']) * 100) . '%',
                'uptime' => $resume['uptime'],
                'localtime' => $resume['localtime'],
            ]);
        }

        self::setError();
    }
}
