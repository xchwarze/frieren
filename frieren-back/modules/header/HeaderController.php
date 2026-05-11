<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\header;

class HeaderController extends \frieren\core\Controller
{
    public $endpointRoutes = [
        'shutDownHardware' => true,
        'resetHardware' => true,
        'serverPing' => true,
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
