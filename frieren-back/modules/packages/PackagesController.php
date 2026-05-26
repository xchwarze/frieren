<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\packages;

use frieren\helper\BackgroundTaskHelper;
use frieren\helper\OpenWrtHelper;

class PackagesController extends \frieren\core\Controller
{
    const TASK_UPDATE = 'opkg-update';
    const TASK_INSTALLED = 'opkg-installed';
    const TASK_AVAILABLE = 'opkg-available';
    const TASK_INSTALL = 'opkg-install';
    const TASK_REMOVE = 'opkg-remove';

    public $endpointRoutes = [
        'updateLists' => true,
        'getUpdateStatus' => true,
        'getInstalledPackages' => true,
        'getInstalledPackagesStatus' => true,
        'getAvailablePackages' => true,
        'getAvailablePackagesStatus' => true,
        'installPackage' => true,
        'getInstallStatus' => true,
        'removePackage' => true,
        'getRemoveStatus' => true,
    ];

    private function getScriptPath()
    {
        return self::getModulePath() . '/bin/package-manager-call.sh';
    }

    public function updateLists()
    {
        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $script = $this->getScriptPath();
        BackgroundTaskHelper::start(self::TASK_UPDATE, "{$script} update");

        return self::setSuccess();
    }

    public function getUpdateStatus()
    {
        return self::setSuccess(BackgroundTaskHelper::getStatus(self::TASK_UPDATE));
    }

    public function getInstalledPackages()
    {
        $script = $this->getScriptPath();
        $outputFile = BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED);
        $command = "{$script} list-installed > {$outputFile} 2>&1";
        OpenWrtHelper::exec($command, true, true);

        return self::setSuccess([
            'packages' => self::setupModuleHelper()::parsePackageFile($outputFile),
        ]);
    }

    public function getInstalledPackagesStatus()
    {
        $completed = BackgroundTaskHelper::isCompleted(self::TASK_INSTALLED);

        return self::setSuccess([
            'completed' => $completed,
            'packages' => $completed
                ? self::setupModuleHelper()::parsePackageFile(BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED))
                : [],
        ]);
    }

    public function getAvailablePackages()
    {
        $script = $this->getScriptPath();
        BackgroundTaskHelper::start(self::TASK_AVAILABLE, "{$script} list-available");

        return self::setSuccess();
    }

    public function getAvailablePackagesStatus()
    {
        $completed = BackgroundTaskHelper::isCompleted(self::TASK_AVAILABLE);

        return self::setSuccess([
            'completed' => $completed,
            'packages' => $completed
                ? self::setupModuleHelper()::parsePackageFile(BackgroundTaskHelper::getLogPath(self::TASK_AVAILABLE))
                : [],
        ]);
    }

    public function installPackage()
    {
        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $script = $this->getScriptPath();
        $packageName = escapeshellarg($this->request['packageName']);
        BackgroundTaskHelper::start(self::TASK_INSTALL, "{$script} install {$packageName}");

        return self::setSuccess();
    }

    public function getInstallStatus()
    {
        return self::setSuccess(BackgroundTaskHelper::getStatus(self::TASK_INSTALL));
    }

    public function removePackage()
    {
        $script = $this->getScriptPath();
        $packageName = escapeshellarg($this->request['packageName']);
        $autoremove = !empty($this->request['autoremove']);
        $flags = $autoremove ? '--force-removal-of-dependent-packages --autoremove ' : '';
        BackgroundTaskHelper::start(self::TASK_REMOVE, "{$script} remove {$flags}{$packageName}");

        return self::setSuccess();
    }

    public function getRemoveStatus()
    {
        return self::setSuccess(BackgroundTaskHelper::getStatus(self::TASK_REMOVE));
    }
}
