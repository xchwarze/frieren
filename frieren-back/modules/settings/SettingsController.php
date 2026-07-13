<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\settings;

class SettingsController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getSectionData' => true,
        'setHostname' => true,
        'setTimezone' => true,
        'setDatetimeFromBrowser' => true,
        'setUserPassword' => true,
        'setPanelTheme' => true,
        'setTerminalSettings' => true,
    ];

    public function getSectionData()
    {
        self::setSuccess(self::setupModuleHelper()::getSectionData());
    }

    public function setHostname()
    {
        if (self::setupModuleHelper()::setSystemHostname($this->request['hostname'])) {
            return self::setSuccess();
        }

        self::setError('Error setting hostname.');
    }

    public function setTimezone()
    {
        if (self::setupModuleHelper()::changeSystemTimeZone($this->request['timezone'])) {
            return self::setSuccess();
        }

        self::setError('Error changing timezone.');
    }

    public function setDatetimeFromBrowser()
    {
        if (self::setupModuleHelper()::changeSystemTimeZone($this->request['timezone']) &&
            self::setupModuleHelper()::syncDatetimeFromBrowser($this->request['datetime'])) {
            return self::setSuccess();
        }

        self::setError('Error setting datetime.');
    }

    public function setUserPassword()
    {
        if (self::setupModuleHelper()::changeUserPassword($this->request['currentPassword'], $this->request['newPassword'])) {
            return self::setSuccess();
        }

        self::setError('Error setting password.');
    }

    public function setPanelTheme()
    {
        if (self::setupModuleHelper()::setPanelTheme($this->request['theme'])) {
            return self::setSuccess();
        }

        self::setError('Error changing panel theme.');
    }

    public function setTerminalSettings()
    {
        $saved = self::setupModuleHelper()::saveTerminalSettings(
            $this->request['terminalTheme'],
            $this->request['fontSize'],
            $this->request['cursorStyle'],
            $this->request['cursorBlink'],
            $this->request['terminalAutologin'],
            $this->request['terminalEnabled']
        );

        if ($saved) {
            return self::setSuccess();
        }

        self::setError('Error saving terminal settings.');
    }
}
