<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\terminal;

use frieren\helper\OpenWrtHelper;
use frieren\modules\settings\ModuleOpenWrtHelper as SettingsHelper;

class TerminalController extends \frieren\core\Controller
{
    const TTYD_PATH = "/usr/bin/ttyd";
    const TTYD_SD_PATH = "/sd/usr/bin/ttyd";

    public $endpointRoutes = [
        'startTerminal' => true,
        'stopTerminal' => true,
        'getStatus' => true,
    ];

    private function getTerminalPath()
    {
        if (OpenWrtHelper::isSDAvailable() && file_exists(self::TTYD_SD_PATH)) {
            return self::TTYD_SD_PATH;
        }

        return self::TTYD_PATH;
    }

    public function startTerminal()
    {
        /*if (!OpenWrtHelper::uciGet("ttyd.@ttyd[0].port")) {
            OpenWrtHelper::uciSet("ttyd.@ttyd[0].port", "1477");
            //$this->uciSet("ttyd.@ttyd[0].index", "/pineapple/modules/Terminal/ttyd/iframe.html");
            exec("/etc/init.d/ttyd disable");
        }*/
        exec("/etc/init.d/ttyd disable");

        $terminal = $this->getTerminalPath();
        $status = OpenWrtHelper::checkRunning($terminal);
        if (!$status) {
            $shell = SettingsHelper::getTerminalAutologin() ? '/bin/ash' : '/bin/login';
            $command = "{$terminal} -p 1477 -i br-lan {$shell}";
            OpenWrtHelper::execBackground($command);
            $status = OpenWrtHelper::checkRunning($terminal);
            if (!$status) {
                $this->logger("Terminal could not be run! command exec: {$command}");
            }
        }

        self::setSuccess(["success" => $status]);
    }

    public function stopTerminal()
    {
        OpenWrtHelper::exec("/usr/bin/killall ttyd");
        $status = OpenWrtHelper::checkRunning($this->getTerminalPath());
        if ($status) {
            $this->logger("Terminal could not be stop! command exec: /usr/bin/killall ttyd");
        }

        self::setSuccess(["success" => !$status]);
    }

    public function getStatus()
    {
        self::setSuccess(["status" => OpenWrtHelper::checkRunning($this->getTerminalPath())]);
    }
}
