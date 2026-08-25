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

    // RFC-1123 single-label hostname: 1-63 chars, alphanumeric start/end, hyphens allowed
    // in between (no leading/trailing hyphen, no dots — this is a hostname, not a FQDN).
    const HOSTNAME_REGEX = '/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/';

    // The panel only ever sends whole-hour GMT offsets from a fixed 25-entry dropdown
    // (frieren-front/src/features/settings/helpers/timezones.js: "GMT0"/"GMT+N"/"GMT-N",
    // N in 1..12) or the equivalent computed from the browser clock ("GMT+0" at the zero
    // offset instead of "GMT0") — never an IANA name or a fractional offset.
    const TIMEZONE_REGEX = '/^GMT[+-]?(0|[1-9]|1[0-2])$/';

    const VALID_THEMES = ['auto', 'dark', 'light'];

    public function setHostname()
    {
        if (!preg_match(self::HOSTNAME_REGEX, $this->request['hostname'] ?? '')) {
            return self::setError('Invalid hostname.');
        }

        if (self::setupModuleHelper()::setSystemHostname($this->request['hostname'])) {
            return self::setSuccess();
        }

        self::setError('Error setting hostname.');
    }

    public function setTimezone()
    {
        if (!preg_match(self::TIMEZONE_REGEX, $this->request['timezone'] ?? '')) {
            return self::setError('Invalid timezone.');
        }

        if (self::setupModuleHelper()::changeSystemTimeZone($this->request['timezone'])) {
            return self::setSuccess();
        }

        self::setError('Error changing timezone.');
    }

    public function setDatetimeFromBrowser()
    {
        if (self::setupModuleHelper()::applyBrowserDatetime($this->request['datetime'], $this->request['timezone'])) {
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
        if (!in_array($this->request['theme'] ?? null, self::VALID_THEMES, true)) {
            return self::setError('Invalid theme.');
        }

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
