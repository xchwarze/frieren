<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\dashboard;

class DashboardController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getSystemResume' => true,
        'getSystemStats' => true,
        'getNews' => true,
        'startSystemUpdate' => true,
        'getSystemUpdateStatus' => true,
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

    public function startSystemUpdate()
    {
        $updateUrl = filter_var($this->request['updateUrl'] ?? '', FILTER_VALIDATE_URL);
        if (!$updateUrl) {
            return self::setError('Invalid update URL');
        }

        self::setupModuleHelper()::startSystemUpdate($updateUrl);
        self::setSuccess();
    }

    public function getSystemUpdateStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getSystemUpdateStatus());
    }
}
