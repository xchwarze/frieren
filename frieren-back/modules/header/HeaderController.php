<?php

namespace frieren\modules\header;

class HeaderController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'shutDownHardware',
        'resetHardware',
        'serverPing',
    ];

    public function shutDownHardware()
    {
        self::setupModuleHelper()::shutDownHardware();

        return self::setSuccess();
    }

    public function resetHardware()
    {
        self::setupModuleHelper()::resetHardware();

        return self::setSuccess();
    }

    public function serverPing()
    {
        if (isset($_SESSION['user_logged']) && $_SESSION['user_logged'] === true) {
            return self::setSuccess();
        }

        self::setError('Not Authenticated');
    }
}
