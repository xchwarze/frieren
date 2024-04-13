<?php

namespace frieren\modules\tcpdump;

use frieren\helper\OpenWrtHelper;

class TcpdumpController extends \frieren\core\Controller
{
    private $pcapDirectory = '/root/.tcpdump';
    private $logPath = '/tmp/fm-tcpdump.log';

    protected $endpointRoutes = [
        //'checkModuleDependencies',
        'installModuleDependencies',
        'getDependencyInstallationStatus',
        'startCapture',
        'stopCapture',
        'getCaptureHistory',
        'getCaptureOutput',
        'getLogContent',
        'deleteCapture',
        'deleteAll',
        'moduleStatus',
    ];

    public function startCapture()
    {
        if (!isset($this->request['command'])) {
            return self::setError('No command provided');
        }

        $filename = date('Y-m-d\TH-i-s') . '.pcap';
        $pcapFilePath = "{$this->pcapDirectory}/{$filename}";
        $command = escapeshellcmd($this->request['command']);
        OpenWrtHelper::execBackground("tcpdump {$command} -w {$pcapFilePath} &> {$this->logPath}");

        return self::setSuccess([
            'outputFile' => $filename
        ]);
    }

    public function stopCapture()
    {
        OpenWrtHelper::exec('killall -9 tcpdump');
        self::setSuccess([
            'success' => OpenWrtHelper::checkRunning('tcpdump')
        ]);
    }

    public function getCaptureHistory()
    {
        $files = array_diff(scandir($this->pcapDirectory), ['..', '.']);
        $files = array_filter($files, function($file) {
            return is_file("{$this->pcapDirectory}/{$file}");
        });

        return self::setSuccess(['files' => array_values($files)]);
    }

    public function getCaptureOutput()
    {
        $captureName = $this->request['outputFile'] ?? false;
        if (empty($captureName)) {
            // grab last saved capture
            $folder = scandir($this->pcapDirectory, SCANDIR_SORT_DESCENDING);
            $captureName = $folder[2] ?? null;
        }

        $filePath = "{$this->pcapDirectory}/{$captureName}";
        if (!file_exists($filePath)) {
            return self::setError("Could not find capture output: {$filePath}");
        }

        $this->responseHandler->streamFile($filePath);
    }

    public function getLogContent()
    {
        if (!file_exists($this->logPath)) {
            return self::setError("Could not find log output: {$this->logPath}");
        }

        return self::setSuccess([
            'isRunning' => file_exists($this->logPath) && OpenWrtHelper::checkRunning('tcpdump'),
            'logContent' => file_get_contents($this->logPath)
        ]);
    }

    public function deleteCapture()
    {
        $filename = $this->request['filename'];
        $filePath = "{$this->pcapDirectory}/{$filename}";
        if (file_exists($filePath)) {
            unlink($filePath);
            return self::setSuccess();
        }

        return self::setError('File does not exist.');
    }

    public function deleteAll()
    {
        $files = array_diff(scandir($this->pcapDirectory), ['..', '.']);
        foreach ($files as $file) {
            $filePath = "{$this->pcapDirectory}/{$file}";
            if (is_file($filePath)) {
                unlink($filePath);
            }
        }

        return self::setSuccess();
    }

    private function getNetworkInterfaces()
    {
        $interfaces = scandir('/sys/class/net/');
        if ($interfaces === false) {
            return [];
        }

        return array_values(array_diff($interfaces, array('.', '..')));
    }

    public function moduleStatus()
    {
        // fix default folder
        if (!file_exists($this->pcapDirectory)) {
            mkdir($this->pcapDirectory, 0777, true);
        }

        // this dependency can be installed by two different packages, so I simplify the default checkModuleDependencies() check
        if (OpenWrtHelper::commandExists('tcpdump')) {
            return self::setSuccess([
                'hasDependencies' => true,
                'isRunning' => file_exists($this->logPath) && OpenWrtHelper::checkRunning('tcpdump'),
                'interfaces' => $this->getNetworkInterfaces(),
            ]);
        }

        return self::setSuccess([
            'hasDependencies' => false,
            'message' => false,
            'isRunning' => false,
            'internalAvailable' => (disk_free_space('/') > self::MIN_DISK_SPACE) && \DeviceConfig::MODULE_USE_INTERNAL_STORAGE,
            'SDAvailable' => OpenWrtHelper::isSDAvailable() && \DeviceConfig::MODULE_USE_USB_STORAGE,
        ]);
    }
}
