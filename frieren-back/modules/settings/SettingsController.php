<?php

namespace frieren\modules\settings;

class SettingsController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'getSectionData',
        'setHostname',
        'setTimezone',
        'setDatetimeFromBrowser',
        'setUserPassword',
        'setPanelTheme'
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
}
