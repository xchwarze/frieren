<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\hardware;

class HardwareController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getUsbDevices',
        'getFileSystemUsage',
        'getSystemLogs',
        'startDiagnosticsScript',
        'getDiagnosticsStatus',
        'downloadDiagnosticsFile'
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
        self::setupCoreHelper()::execBackground($scriptPath);

        self::setSuccess();
    }

    public function getDiagnosticsStatus()
    {
        return self::setSuccess([
            'status' => @file_get_contents('/tmp/diagnostics_status.log'),
            'completed' => file_exists('/tmp/diagnostics_done.flag'),
        ]);
    }

    public function downloadDiagnosticsFile()
    {
        $this->responseHandler->streamFile('/tmp/diagnostics_output.log');
    }
}
