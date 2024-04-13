<?php

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
            if (json_last_error() !== JSON_ERROR_NONE) {
                continue;
            }

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
-        $module = [
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
        //$url = sprintf(\DeviceConfig::MODULES_PATH, \DeviceConfig::SERVER_URL);
        //$moduleData = self::setupModuleHelper()::fileGetContentsSSL($url);
        $moduleData = file_get_contents(__DIR__ . '/mock.json');
        if ($moduleData !== false) {
            $moduleData = json_decode($moduleData);
            if (json_last_error() === JSON_ERROR_NONE) {
                return self::setSuccess($moduleData);
            }
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

    private function getModuleTemp()
    {
        return $this->request['destination'] === 'sd' ? '/sd/tmp' : '/tmp';
    }

    public function downloadModule()
    {
        @unlink(self::DOWN_FLAG);

        $destination = $this->getModuleTemp();
        @mkdir($destination, 0777, true);

        $fileName = self::getModuleCompressName($this->request['moduleName']);
        $url = sprintf(\DeviceConfig::INSTALL_MODULE_PATH, \DeviceConfig::SERVER_URL, $fileName);
        self::setupModuleHelper()::downloadFile($url, "{$destination}/{$fileName}", self::DOWN_FLAG);

        self::setSuccess();
    }

    public function downloadStatus()
    {
        if (file_exists(self::DOWN_FLAG)) {
            $destination = $this->getModuleTemp();
            $fileName = self::getModuleCompressName($this->request['moduleName']);
            if (hash_file('sha256', "{$destination}/{$fileName}") == $this->request['checksum']) {
                return self::setSuccess();
            }
        }

        self::setSuccess(['success' => false]);
    }

    public function installModule()
    {
        $moduleName = $this->request['moduleName'];
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;
        $useSD = $this->request['destination'] === 'sd';

        @unlink(self::INSTALL_FLAG);
        $this->removeModule();

        if ($useSD) {
            @mkdir($moduleSDDirPath, 0777, true);
            exec("ln -s {$moduleSDDirPath}/{$moduleName} {$moduleDirPath}/{$moduleName}");
        }

        $installPath = $useSD ? $moduleSDDirPath : $moduleDirPath;
        $tempPath = $this->getModuleTemp();
        $fileName = self::getModuleCompressName($moduleName);
        self::setupModuleHelper()::execBackground(
            "tar -xzvC {$installPath} -f {$tempPath}/{$fileName} && " .
            "rm {$tempPath}/{$fileName} && " .
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
        $moduleDirPath = \DeviceConfig::MODULE_ROOT_FOLDER;
        $moduleSDDirPath = \DeviceConfig::MODULE_SD_ROOT_FOLDER;

        $alreadyInstalled = is_dir("{$moduleDirPath}/{$moduleName}") || is_dir("{$moduleSDDirPath}/{$moduleName}");
        $validSpace = disk_free_space('/') > ($this->request['size'] + self::MIN_DISK_SPACE);

        self::setSuccess([
            'alreadyInstalled' => $alreadyInstalled,
            'internalAvailable' => $validSpace && \DeviceConfig::MODULE_USE_INTERNAL_STORAGE,
            'SDAvailable' => self::setupModuleHelper()::isSDAvailable() && \DeviceConfig::MODULE_USE_USB_STORAGE,
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
