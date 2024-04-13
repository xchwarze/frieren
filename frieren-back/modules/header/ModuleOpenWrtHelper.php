<?php

namespace frieren\modules\dashboard;

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
