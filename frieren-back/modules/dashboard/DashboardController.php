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
        'getSystemResume' => true,
        'getSystemStats' => true,
        'getNews' => true,
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
            return self::setSuccess($resume);
        }

        self::setError();
    }

    public function getNews()
    {
        $url = sprintf(\DeviceConfig::NEWS_JSON_PATH, \DeviceConfig::MODULE_SERVER_URL);
        $newsData = self::setupCoreHelper()::fileGetContentsSSL($url);
        if ($newsData !== false) {
            return self::setSuccess(json_decode($newsData));
        }

        self::setError('Error connecting to remote host. Please check your connection.');
    }
}
