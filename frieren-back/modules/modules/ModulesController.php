<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\modules;

use frieren\helper\BackgroundTaskHelper;

class ModulesController extends \frieren\core\Controller
{
    const UCI_SIDEBAR = 'frieren.@settings[0].sidebar';
    const TASK_DOWNLOAD = 'module-download';
    const TASK_INSTALL = 'module-install';

    public $endpointRoutes = [
        'getModuleList' => true,
        'getAvailableModules' => true,
        'getInstalledModules' => true,
        'downloadModule' => true,
        'downloadStatus' => true,
        'installModule' => true,
        'installStatus' => true,
        'checkDestination' => true,
        'removeModule' => true,
        'pinModule' => true,
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
        $sidebarSettings = self::setupCoreHelper()::uciGetJson(self::UCI_SIDEBAR, false);

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
            'name'    => $info['name'],
            'title'   => $info['title'],
            'version' => $info['version'] ?? '0.0.0',
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
        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $url = sprintf(\DeviceConfig::MODULE_JSON_PATH, \DeviceConfig::MODULE_SERVER_URL);
        $moduleData = self::setupCoreHelper()::fileGetContentsSSL($url);
        if ($moduleData !== false) {
            return self::setSuccess(json_decode($moduleData));
        }

        self::setError('Error connecting to remote host. Please check your connection.');
    }

    public function getInstalledModules()
    {
        $moduleRoot = \DeviceConfig::MODULE_ROOT_FOLDER;
        $modulesDir = new \DirectoryIterator($moduleRoot);
        if (!$modulesDir->isReadable()) {
            return self::setError('Unable to access modules directory');
        }

        $moduleSizes = self::setupModuleHelper()::getAllModuleSizes($moduleRoot);
        $modules = [];
        $sidebarSettings = self::setupCoreHelper()::uciGetJson(self::UCI_SIDEBAR, false);

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
                'size' => $moduleSizes[basename($moduleFolder)] ?? '0K',
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
        if (!self::setupCoreHelper()::hasInternetConnection()) {
            return self::setError('No internet connection available.');
        }

        $flagPath = BackgroundTaskHelper::getFlagPath(self::TASK_DOWNLOAD);
        @unlink($flagPath);

        $remoteFileName = self::getModuleCompressName(
            "{$this->request['moduleName']}-{$this->request['version']}"
        );
        $localFileName = self::getModuleCompressName($this->request['moduleName']);
        $filePath = "/tmp/{$localFileName}";
        $url = sprintf(\DeviceConfig::MODULE_PACKAGE_PATH, \DeviceConfig::MODULE_SERVER_URL, $remoteFileName);
        self::setupCoreHelper()::downloadFile($url, $filePath, $flagPath);

        self::setSuccess([
            'success' => true,
            'url' => $url,
        ]);
    }

    public function downloadStatus()
    {
        self::setSuccess([
            'completed' => BackgroundTaskHelper::isCompleted(self::TASK_DOWNLOAD),
        ]);
    }

    public function installModule()
    {
        $moduleName = $this->request['moduleName'];
        $fileName = self::getModuleCompressName($moduleName);
        $filePath = "/tmp/{$fileName}";
        if (hash_file('sha256', $filePath) !== $this->request['checksum']) {
            return self::setError('Checksum mismatch');
        }

        $this->removeModuleFiles($moduleName);

        $useSD = $this->request['destination'] === 'sd';
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;
        $safeModuleName = escapeshellarg($moduleName);
        if ($useSD) {
            @mkdir($moduleSDDirPath, 0777, true);
            exec("ln -s {$moduleSDDirPath}/{$safeModuleName} {$moduleDirPath}/{$safeModuleName}");
        }

        $installPath = escapeshellarg($useSD ? $moduleSDDirPath : $moduleDirPath);
        $safeFilePath = escapeshellarg($filePath);
        BackgroundTaskHelper::start(
            self::TASK_INSTALL,
            "tar -xzC {$installPath} -f {$safeFilePath} && rm {$safeFilePath}"
        );

        self::setSuccess();
    }

    public function installStatus()
    {
        self::setSuccess([
            'completed' => BackgroundTaskHelper::isCompleted(self::TASK_INSTALL),
        ]);
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
        $this->removeModuleFiles($this->request['moduleName']);
        self::setSuccess();
    }

    private function removeModuleFiles($moduleName)
    {
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $moduleName)) {
            throw new \Exception('Invalid module name');
        }

        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;
        $modulePath = "{$moduleDirPath}/{$moduleName}";
        $modulePathSD = "{$moduleSDDirPath}/{$moduleName}";

        if (is_link($modulePath)) {
            @unlink($modulePath);
            exec("rm -rf " . escapeshellarg($modulePathSD));
        } else if (is_dir($modulePath)) {
            exec("rm -rf " . escapeshellarg($modulePath));
        }
    }

    public function pinModule()
    {
        self::setupCoreHelper();
        $moduleName = $this->request['moduleName'];
        $status = $this->request['status'];
        $currentSettings = $this->coreHelper::uciGetJson(self::UCI_SIDEBAR, false);

        if ($status === 'pin') {
            $currentSettings[$moduleName] = true;
        } else if ($status === 'unpin' && isset($currentSettings[$moduleName])) {
            unset($currentSettings[$moduleName]);
        }
        $this->coreHelper::uciSetJson(self::UCI_SIDEBAR, $currentSettings);

        self::setSuccess();
    }
}
