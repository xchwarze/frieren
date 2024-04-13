<?php

namespace frieren\modules\terminal;

use frieren\helper\OpenWrtHelper;

class TerminalController extends \frieren\core\Controller
{
    public $endpointRoutes = ['getDependenciesStatus', 'managerDependencies', 'getDependenciesInstallStatus', 'startTerminal', 'stopTerminal', 'getStatus', 'getLog'];
    const TTYD_PATH = "/usr/bin/ttyd";
    const TTYD_SD_PATH = "/sd/usr/bin/ttyd";
    const LOG_PATH = "/pineapple/modules/Terminal/module.log";

    private function addLog($massage)
    {
        $entry = "[" . date("Y-m-d H:i:s") . "] {$massage}\n";
        file_put_contents(self::LOG_PATH, $entry, FILE_APPEND);
    }

    private function getTerminalPath()
    {
        if (OpenWrtHelper::isSDAvailable() && file_exists(self::TTYD_SD_PATH)) {
            return self::TTYD_SD_PATH;
        }

        return self::TTYD_PATH;
    }

    public function getDependenciesStatus()
    {
        $response = [
            "installed" => false,
            "processing" => false
        ];

        if (file_exists("/tmp/terminal.progress")) {
            $response["install"] = "Installing...";
            $response["processing"] = true;
        } else if ($this->checkDependencyInstalled()) {
            $response["install"] = "Remove";
            $response["installed"] = true;
        }

        self::setSuccess($response);
    }

    public function checkDependencyInstalled()
    {
        if (OpenWrtHelper::checkDependency("ttyd")) {
            if (!OpenWrtHelper::uciGet("ttyd.@ttyd[0].port")) {
                OpenWrtHelper::uciSet("ttyd.@ttyd[0].port", "1477");
                //$this->uciSet("ttyd.@ttyd[0].index", "/pineapple/modules/Terminal/ttyd/iframe.html");
                exec("/etc/init.d/ttyd disable");
            }

            return true;
        }

        return false;
    }

    public function managerDependencies()
    {
        $action = $this->checkDependencyInstalled() ? "remove" : "install";
        OpenWrtHelper::execBackground("/pineapple/modules/Terminal/scripts/dependencies.sh {$action}");
        self::setSuccess();
    }

    public function getDependenciesInstallStatus()
    {
        self::setSuccess(["success" => !file_exists("/tmp/terminal.progress")]);
    }

    public function startTerminal()
    {
        /*
        exec("/etc/init.d/ttyd start", $info);
        $status = implode("\n", $info);
        $this->response = [
            "success" => empty(trim($status)),
            "message" => $status,
        ];
        */
        $terminal = $this->getTerminalPath();
        $status = OpenWrtHelper::checkRunning($terminal);
        if (!$status) {
            $command = "{$terminal} -p 1477 -i br-lan /bin/login";
            OpenWrtHelper::execBackground($command);

            sleep(1);
            $status = OpenWrtHelper::checkRunning($terminal);
            if (!$status) {
                $this->addLog("Terminal could not be run! command: {$command}");
            }
        }

        self::setSuccess(["success" => $status]);
    }

    public function stopTerminal()
    {
        /*
        exec("/etc/init.d/ttyd stop", $info);
        $status = implode("\n", $info);
        $this->response = [
            "success" => empty(trim($status)),
            "message" => $status,
        ];
        */
        exec("/usr/bin/pkill ttyd");
        $status = OpenWrtHelper::checkRunning($this->getTerminalPath());
        if ($status) {
            $this->addLog("Terminal could not be stop! command: /usr/bin/pkill ttyd");
        }
        self::setSuccess(["success" => !$status]);
    }

    public function getStatus()
    {
        self::setSuccess(["status" => OpenWrtHelper::checkRunning($this->getTerminalPath())]);
    }

    public function getLog()
    {
        if (!file_exists(self::LOG_PATH)) {
            touch(self::LOG_PATH);
        }

        self::setSuccess(["moduleLog" => file_get_contents(self::LOG_PATH)]);
    }
}
