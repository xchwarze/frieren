<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\terminal;

use frieren\helper\OpenWrtHelper;

class TerminalController extends \frieren\core\Controller
{
    const TTYD_PATH = "/usr/bin/ttyd";
    const TTYD_SD_PATH = "/sd/usr/bin/ttyd";

    public $endpointRoutes = [
        'startTerminal',
        'stopTerminal',
        'getStatus'
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

        $terminal = $this->getTerminalPath();
        $status = OpenWrtHelper::checkRunning($terminal);
        if (!$status) {
            $command = "{$terminal} -p 1477 -i br-lan /bin/login";
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
