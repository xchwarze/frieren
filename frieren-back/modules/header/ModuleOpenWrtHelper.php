<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\header;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    /**
     * Shuts down the hardware by executing the 'poweroff' command in the background.
     *
     * @return void
     */
    public static function shutDownHardware()
    {
        OpenWrtHelper::execBackground('poweroff');
    }

    /**
     * Reset hardware by rebooting the system.
     *
     * @return void
     */
    public static function resetHardware()
    {
        OpenWrtHelper::execBackground('reboot');
    }
}
