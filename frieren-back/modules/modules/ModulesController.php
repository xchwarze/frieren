<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\modules;

class ModulesController extends \frieren\core\Controller
{
    const UCI_SIDEBAR = 'frieren.@settings[0].sidebar';
    const DOWN_FLAG = '/tmp/moduleDownloaded';
    const INSTALL_FLAG = '/tmp/moduleInstalled';
    const MIN_DISK_SPACE = 524288;

    public $endpointRoutes = [
        'getModuleList',
        'getAvailableModules',
        'getInstalledModules',
        'downloadModule',
        'downloadStatus',
        'installModule',
        'installStatus',
        'checkDestination',
        'removeModule',
        'pinModule',
    ];

    public function getModuleList()
    {
        $modulesDir = new \DirectoryIterator(\DeviceConfig::MODULE_ROOT_FOLDER);
        if (!$modulesDir->isReadable()) {
            return self::setError('Unable to access modules directory');
        }

        $modules = [
            'sidebar' => [],
            'external' => [],
            'externalWithSidebar' => []
        ];
        $sidebarSettings = self::setupCoreHelper()::uciGetJson(self::UCI_SIDEBAR);

        foreach ($modulesDir as $file) {
            if ($file->isDot() || !$file->isDir()) {
                continue;
            }

            $moduleFolder = $file->getRealPath();
            $moduleManifest = "{$moduleFolder}/manifest.json";
            if (!file_exists($moduleManifest)) {
                continue;
            }

            $info = json_decode(file_get_contents($moduleManifest), true);
            $this->categorizeModule($info, $sidebarSettings, $modules);
        }

        // fix array order
        $modules['sidebar'] = array_merge($modules['sidebar'], $modules['externalWithSidebar']);
        ksort($modules['sidebar']);

        self::setSuccess([
            'external' => $modules['external'],
            'sidebar' => array_values($modules['sidebar']),
        ]);
    }

    private function categorizeModule($info, $sidebarSettings, &$modules) {
        $module = [
            'name'  => $info['name'],
            'title' => $info['title'],
        ];

        if ($info['forceSidebar'] || isset($sidebarSettings[$module['name']])) {
            $variant = $info['system'] ? 'sidebar' : 'externalWithSidebar';
            $module['icon'] = $info['icon'] ?? 'package';
            if (isset($info['order']) && !isset($modules['sidebar'][$info['order']])) {
                $modules[$variant][$info['order']] = $module;
            } else {
                $modules[$variant][] = $module;
            }
        }

        if (!$info['system']) {
            $modules['external'][] = $module;
        }
    }

    public function getAvailableModules()
    {
        $url = sprintf(\DeviceConfig::MODULE_JSON_PATH, \DeviceConfig::MODULE_SERVER_URL);
        $moduleData = self::setupCoreHelper()::fileGetContentsSSL($url);
        if ($moduleData !== false) {
            return self::setSuccess(json_decode($moduleData));
        }

        self::setError('Error connecting to remote host. Please check your connection.');
    }

    public function getInstalledModules()
    {
        $modulesDir = new \DirectoryIterator(\DeviceConfig::MODULE_ROOT_FOLDER);
        if (!$modulesDir->isReadable()) {
            return self::setError('Unable to access modules directory');
        }

        self::setupModuleHelper();
        $modules = [];
        $sidebarSettings = self::setupCoreHelper()::uciGetJson(self::UCI_SIDEBAR);

        foreach ($modulesDir as $file) {
            if ($file->isDot() || !$file->isDir()) {
                continue;
            }

            $moduleFolder = $file->getRealPath();
            $moduleManifest = "{$moduleFolder}/manifest.json";
            if (!file_exists($moduleManifest)) {
                continue;
            }

            $info = json_decode(file_get_contents($moduleManifest), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                continue;
            }

            if (\DeviceConfig::MODULE_HIDE_SYSTEM_MODULES === true && $info['system']) {
                continue;
            }

            $modules[] = [
                'name' => $info['name'],
                'title' => $info['title'],
                'icon'  => $info['icon'] ?? 'package',
                'sidebar' => isset($sidebarSettings[$info['name']]),
                'forceSidebar' => $info['forceSidebar'],
                'description' => $info['description'],
                'author' => $info['author']['name'],
                'version' => $info['version'],
                'repository' => $info['repository'],
                'bugs' => $info['bugs'],
                'system' => $info['system'],
                'size' => $this->moduleHelper::getLocalModuleSize($moduleFolder),
            ];
        }

        self::setSuccess($modules);
    }

    private function getModuleCompressName($name)
    {
        return "{$name}.tar.gz";
    }

    public function downloadModule()
    {
        @unlink(self::DOWN_FLAG);

        $fileName = self::getModuleCompressName($this->request['moduleName']);
        $filePath = "/tmp/{$fileName}";
        $url = sprintf(\DeviceConfig::MODULE_PACKAGE_PATH, \DeviceConfig::MODULE_SERVER_URL, $fileName);
        self::setupCoreHelper()::downloadFile($url, $filePath , self::DOWN_FLAG);

        self::setSuccess([
            'success' => true,
            'url' => $url,
        ]);
    }

    public function downloadStatus()
    {
        self::setSuccess(['success' => file_exists(self::DOWN_FLAG)]);
    }

    public function installModule()
    {
        $moduleName = $this->request['moduleName'];
        $fileName = self::getModuleCompressName($moduleName);
        $filePath = "/tmp/{$fileName}";
        if (hash_file('sha256', $filePath) !== $this->request['checksum']) {
            return self::setError('Checksum mismatch');
        }

        @unlink(self::INSTALL_FLAG);
        $this->removeModule();

        $useSD = $this->request['destination'] === 'sd';
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;
        if ($useSD) {
            @mkdir($moduleSDDirPath, 0777, true);
            exec("ln -s {$moduleSDDirPath}/{$moduleName} {$moduleDirPath}/{$moduleName}");
        }

        $installPath = $useSD ? $moduleSDDirPath : $moduleDirPath;
        self::setupCoreHelper()::execBackground(
            "tar -xzC {$installPath} -f {$filePath} && " .
            "rm {$filePath} && " .
            "touch " . self::INSTALL_FLAG
        );

        self::setSuccess();
    }

    public function installStatus()
    {
        self::setSuccess(['success' => file_exists(self::INSTALL_FLAG)]);
    }

    public function checkDestination()
    {
        $moduleName = $this->request['moduleName'];
        $moduleSize = $this->request['moduleSize'];
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;

        $alreadyInstalled = is_dir("{$moduleDirPath}/{$moduleName}") || is_dir("{$moduleSDDirPath}/{$moduleName}");
        $validSpace = disk_free_space('/') > ($moduleSize + self::MIN_DISK_SPACE);

        self::setSuccess([
            'alreadyInstalled' => $alreadyInstalled,
            'isInternalAvailable' => $validSpace && \DeviceConfig::MODULE_USE_INTERNAL_STORAGE,
            'isSDAvailable' => self::setupCoreHelper()::isSDAvailable() && \DeviceConfig::MODULE_USE_USB_STORAGE,
        ]);
    }

    public function removeModule()
    {
        $moduleName = $this->request['moduleName'];
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;
        $modulePath = "{$moduleDirPath}/{$moduleName}";
        $modulePathSD = "{$moduleSDDirPath}/{$moduleName}";

        if (is_link($modulePath)) {
            @unlink($modulePath);
            exec("rm -rf {$modulePathSD}");
        } else if (is_dir($modulePath)) {
            exec("rm -rf {$modulePath}");
        }

        self::setSuccess();
    }

    public function pinModule()
    {
        self::setupCoreHelper();
        $moduleName = $this->request['moduleName'];
        $status = $this->request['status'];
        $currentSettings = $this->coreHelper::uciGetJson(self::UCI_SIDEBAR);

        if ($status === 'pin') {
            $currentSettings[$moduleName] = true;
        } else if ($status === 'unpin' && isset($currentSettings[$moduleName])) {
            unset($currentSettings[$moduleName]);
        }
        $this->coreHelper::uciSetJson(self::UCI_SIDEBAR, $currentSettings);

        self::setSuccess();
    }
}
