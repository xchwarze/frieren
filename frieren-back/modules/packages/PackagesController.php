<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\packages;

class PackagesController extends \frieren\core\Controller
{
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

    public function updateLists()
    {
        self::setupModuleHelper()::updateLists();
        self::setSuccess();
    }

    public function getUpdateStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getUpdateStatus());
    }

    public function getInstalledPackages()
    {
        self::setupModuleHelper()::listInstalledPackages();
        self::setSuccess();
    }

    public function getInstalledPackagesStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getInstalledPackagesStatus());
    }

    public function getAvailablePackages()
    {
        self::setupModuleHelper()::listAvailablePackages();
        self::setSuccess();
    }

    public function getAvailablePackagesStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getAvailablePackagesStatus());
    }

    public function installPackage()
    {
        $packageName = escapeshellarg($this->request['packageName']);
        self::setupModuleHelper()::installPackage($packageName);
        self::setSuccess();
    }

    public function getInstallStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getInstallStatus());
    }

    public function removePackage()
    {
        $packageName = escapeshellarg($this->request['packageName']);
        self::setupModuleHelper()::removePackage($packageName);
        self::setSuccess();
    }

    public function getRemoveStatus()
    {
        self::setSuccess(self::setupModuleHelper()::getRemoveStatus());
    }
}
