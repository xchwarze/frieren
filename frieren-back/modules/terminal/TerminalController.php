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

    // ttyd is launched via nohup (execBackground) and forks asynchronously, so an
    // immediate pgrep can miss it and report a spurious failure — this is why the
    // very first open after install fails while later ones succeed. Poll briefly to
    // let the process spawn and bind port 5001 before reporting status.
    const START_POLL_ATTEMPTS = 10;
    const START_POLL_INTERVAL_US = 150000; // 150ms -> up to ~1.5s total

    private function getTerminalPath()
    {
        if (OpenWrtHelper::isSDAvailable() && file_exists(self::TTYD_SD_PATH)) {
            return self::TTYD_SD_PATH;
        }

        return self::TTYD_PATH;
    }

    private function waitForRunning($terminal)
    {
        // Sleep before each check: ttyd never appears in under one interval, so the
        // happy path costs a single pgrep instead of two or three.
        for ($attempt = 0; $attempt < self::START_POLL_ATTEMPTS; $attempt++) {
            usleep(self::START_POLL_INTERVAL_US);
            if (OpenWrtHelper::checkRunning($terminal)) {
                return true;
            }
        }

        return false;
    }

    public function startTerminal()
    {
        if (!SettingsHelper::isTerminalEnabled()) {
            return self::setError('Terminal is disabled');
        }

        // disable ttyd instance
        exec("/etc/init.d/ttyd stop");
        OpenWrtHelper::execBackground("/etc/init.d/ttyd disable");

        // terminal implementation
        $terminal = $this->getTerminalPath();
        $status = OpenWrtHelper::checkRunning($terminal);
        if (!$status) {
            $shell = SettingsHelper::getTerminalAutologin() ? '/bin/ash' : '/bin/login';
            // Launch from /root so the (autologin) shell opens there instead of
            // inheriting the PHP process cwd (/usr/share/frieren/api). The cd is
            // confined to this subshell; all paths here are fixed (no user input).
            $command = "sh -c 'cd /root && {$terminal} -p 5001 -i br-lan {$shell}'";
            OpenWrtHelper::execBackground($command);
            $status = $this->waitForRunning($terminal);
            if (!$status) {
                $this->logger("Terminal could not be run! command exec: {$command}");
            }
        }

        $response = ["success" => $status];
        if ($status) {
            $response['terminalTheme'] = SettingsHelper::getTerminalTheme();
            $response['fontSize'] = SettingsHelper::getTerminalFontSize();
            $response['cursorStyle'] = SettingsHelper::getTerminalCursorStyle();
            $response['cursorBlink'] = SettingsHelper::getTerminalCursorBlink();
        }

        self::setSuccess($response);
    }

    public function stopTerminal()
    {
        if (!SettingsHelper::isTerminalEnabled()) {
            return self::setError('Terminal is disabled');
        }

        OpenWrtHelper::exec("/usr/bin/killall ttyd");
        $status = OpenWrtHelper::checkRunning($this->getTerminalPath());
        if ($status) {
            $this->logger("Terminal could not be stop! command exec: /usr/bin/killall ttyd");
        }

        self::setSuccess(["success" => !$status]);
    }

    public function getStatus()
    {
        if (!SettingsHelper::isTerminalEnabled()) {
            return self::setSuccess(["status" => false]);
        }

        self::setSuccess(["status" => OpenWrtHelper::checkRunning($this->getTerminalPath())]);
    }
}
