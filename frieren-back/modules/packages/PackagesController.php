<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\packages;

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

    private function dependencyInstallInProgress()
    {
        return \frieren\helper\BackgroundTaskHelper::isRunning(self::TASK_DEPENDENCIES);
    }

    public function updateLists()
    {
        if ($this->dependencyInstallInProgress()) {
            return self::setError('A module dependency installation is in progress. Please wait until it finishes.');
        }

        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $script = $this->getScriptPath();
        \frieren\helper\BackgroundTaskHelper::start(self::TASK_UPDATE, "{$script} update");

        return self::setSuccess();
    }

    public function getUpdateStatus()
    {
        return self::setSuccess(\frieren\helper\BackgroundTaskHelper::getStatus(self::TASK_UPDATE));
    }

    public function getInstalledPackages()
    {
        $script = $this->getScriptPath();
        $outputFile = \frieren\helper\BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED);
        $command = "{$script} list-installed > {$outputFile} 2>&1";
        OpenWrtHelper::exec($command, true, true);

        return self::setSuccess([
            'packages' => self::setupModuleHelper()::parsePackageFile($outputFile),
        ]);
    }

    public function getInstalledPackagesStatus()
    {
        $completed = \frieren\helper\BackgroundTaskHelper::isCompleted(self::TASK_INSTALLED);

        return self::setSuccess([
            'completed' => $completed,
            'packages' => $completed
                ? self::setupModuleHelper()::parsePackageFile(\frieren\helper\BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED))
                : [],
        ]);
    }

    public function getAvailablePackages()
    {
        $script = $this->getScriptPath();
        \frieren\helper\BackgroundTaskHelper::start(self::TASK_AVAILABLE, "{$script} list-available");

        return self::setSuccess();
    }

    public function getAvailablePackagesStatus()
    {
        $completed = \frieren\helper\BackgroundTaskHelper::isCompleted(self::TASK_AVAILABLE);

        return self::setSuccess([
            'completed' => $completed,
            'packages' => $completed
                ? self::setupModuleHelper()::parsePackageFile(\frieren\helper\BackgroundTaskHelper::getLogPath(self::TASK_AVAILABLE))
                : [],
        ]);
    }

    public function installPackage()
    {
        if ($this->dependencyInstallInProgress()) {
            return self::setError('A module dependency installation is in progress. Please wait until it finishes.');
        }

        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $script = $this->getScriptPath();
        $packageName = escapeshellarg($this->request['packageName']);
        \frieren\helper\BackgroundTaskHelper::start(self::TASK_INSTALL, "{$script} install {$packageName}");

        return self::setSuccess();
    }

    public function getInstallStatus()
    {
        return self::setSuccess(\frieren\helper\BackgroundTaskHelper::getStatus(self::TASK_INSTALL));
    }

    public function removePackage()
    {
        if ($this->dependencyInstallInProgress()) {
            return self::setError('A module dependency installation is in progress. Please wait until it finishes.');
        }

        $script = $this->getScriptPath();
        $packageName = escapeshellarg($this->request['packageName']);
        $autoremove = !empty($this->request['autoremove']);
        $flags = $autoremove ? '--force-removal-of-dependent-packages --autoremove ' : '';
        \frieren\helper\BackgroundTaskHelper::start(self::TASK_REMOVE, "{$script} remove {$flags}{$packageName}");

        return self::setSuccess();
    }

    public function getRemoveStatus()
    {
        return self::setSuccess(\frieren\helper\BackgroundTaskHelper::getStatus(self::TASK_REMOVE));
    }
}
