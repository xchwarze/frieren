<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\system;

class SystemController extends \frieren\core\Controller
{
    const TASK_DIAGNOSTICS = 'diagnostics';
    const SERVICE_NAME_REGEX = '/^[a-zA-Z0-9_.-]+$/';
    const SERVICE_CONTROL_COMMANDS = ['start', 'stop', 'restart'];

    public $endpointRoutes = [
        'getUsbDevices' => true,
        'getFileSystemUsage' => true,
        'getSystemLogs' => true,
        'startDiagnosticsScript' => true,
        'getDiagnosticsStatus' => true,
        'downloadDiagnosticsFile' => true,
        'getServices' => true,
        'controlService' => true,
        'toggleEnabled' => true,
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
        \frieren\helper\BackgroundTaskHelper::start(self::TASK_DIAGNOSTICS, $scriptPath);

        self::setSuccess();
    }

    public function getDiagnosticsStatus()
    {
        return self::setSuccess([
            'status' => @file_get_contents(\frieren\helper\BackgroundTaskHelper::getLogPath(self::TASK_DIAGNOSTICS)),
            'completed' => \frieren\helper\BackgroundTaskHelper::isCompleted(self::TASK_DIAGNOSTICS),
        ]);
    }

    public function downloadDiagnosticsFile()
    {
        $this->responseHandler->streamFile('/tmp/diagnostics_output.log');
    }

    /**
     * Validates the requested service name: strict whitelist regex AND the
     * init script must actually exist. Returns the clean name or false.
     *
     * @return string|false
     */
    private function resolveServiceName()
    {
        $name = $this->request['name'] ?? '';
        if (!is_string($name) || !preg_match(self::SERVICE_NAME_REGEX, $name)) {
            return false;
        }

        if (!self::setupModuleHelper()::serviceExists($name)) {
            return false;
        }

        return $name;
    }

    public function getServices()
    {
        return self::setSuccess([
            'services' => self::setupModuleHelper()::listServices(),
        ]);
    }

    public function controlService()
    {
        $name = $this->resolveServiceName();
        if ($name === false) {
            return self::setError('Invalid service');
        }

        $command = $this->request['command'] ?? '';
        if (!in_array($command, self::SERVICE_CONTROL_COMMANDS, true)) {
            return self::setError('Unsupported command');
        }

        if (!self::setupModuleHelper()::controlService($name, $command)) {
            return self::setError("Failed to {$command} {$name}");
        }

        return self::setSuccess(array_merge(
            ['name' => $name],
            self::setupModuleHelper()::serviceState($name)
        ));
    }

    public function toggleEnabled()
    {
        $name = $this->resolveServiceName();
        if ($name === false) {
            return self::setError('Invalid service');
        }

        $enabled = filter_var($this->request['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if (!self::setupModuleHelper()::setServiceEnabled($name, $enabled)) {
            $action = $enabled ? 'enable' : 'disable';
            return self::setError("Failed to {$action} {$name}");
        }

        return self::setSuccess(array_merge(
            ['name' => $name],
            self::setupModuleHelper()::serviceState($name)
        ));
    }
}
