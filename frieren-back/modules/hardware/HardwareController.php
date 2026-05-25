<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\hardware;

use frieren\helper\BackgroundTaskHelper;

class HardwareController extends \frieren\core\Controller
{
    const TASK_DIAGNOSTICS = 'diagnostics';

    public $endpointRoutes = [
        'getUsbDevices' => true,
        'getFileSystemUsage' => true,
        'getSystemLogs' => true,
        'startDiagnosticsScript' => true,
        'getDiagnosticsStatus' => true,
        'downloadDiagnosticsFile' => true,
    ];

    public function getUsbDevices()
    {
        $data = self::setupModuleHelper()::getUsbDevices();
        if ($data) {
            return self::setSuccess($data);
        }

        self::setError('Error getting usb devices.');
    }

    public function getFileSystemUsage()
    {
        $data = self::setupModuleHelper()::getFileSystemUsage();
        if ($data) {
            return self::setSuccess($data);
        }

        self::setError('Error getting file system usage.');
    }

    public function getSystemLogs()
    {
        $data = self::setupModuleHelper()::getSystemLogs($this->request['search'] ?? null);
        if ($data) {
            return self::setSuccess($data);
        }

        self::setError('Error getting system logs.');
    }

    public function startDiagnosticsScript()
    {
        $scriptPath = self::getModulePath() . '/bin/diagnostics.sh';
        BackgroundTaskHelper::start(self::TASK_DIAGNOSTICS, $scriptPath);

        self::setSuccess();
    }

    public function getDiagnosticsStatus()
    {
        return self::setSuccess([
            'status' => @file_get_contents(BackgroundTaskHelper::getLogPath(self::TASK_DIAGNOSTICS)),
            'completed' => BackgroundTaskHelper::isCompleted(self::TASK_DIAGNOSTICS),
        ]);
    }

    public function downloadDiagnosticsFile()
    {
        $this->responseHandler->streamFile('/tmp/diagnostics_output.log');
    }
}
