<?php

namespace frieren\helper;

/**
 * Provides helper functionalities specific to OpenWrt environment.
 * This class includes methods for executing system commands, managing configurations, and other utilities
 * that are commonly used in the context of OpenWrt system management.
 */
class OpenWrtHelper
{
    /**
     * Executes a command in the background.
     *
     * @param string $command The command to execute.
     * @return mixed The result of the command execution.
     */
    public function execBackground($command)
    {
        $command = escapeshellarg($command);
        exec("echo \"{$command}\" | /usr/bin/at now", $result);

        return $result;
    }

    /**
     * Checks if a specific process is running.
     *
     * @param string $processName The name of the process to check.
     * @param bool $isFullPath Set to true to check using the full path of the process.
     * @return bool True if the process is running, false otherwise.
     */
    public function checkRunning($processName, $isFullPath = false)
    {
        $processName = escapeshellarg($processName);
        $command = $isFullPath ? "/usr/bin/pgrep -f" : "/usr/bin/pgrep";
        exec("{$command} {$processName}", $output);

        return count($output) > 0;
    }

    /**
     * Checks if a dependency is installed.
     *
     * @param string $dependencyName The name of the dependency to check.
     * @return bool True if the dependency is installed, false otherwise.
     */
    public function checkDependency($dependencyName)
    {
        $dependencyName = escapeshellarg($dependencyName);
        exec("/usr/bin/which {$dependencyName}", $output);

        return !(trim($output[0]) === "");
    }

    /**
     * Retrieves a value from the UCI (Unified Configuration Interface).
     *
     * @param string $uciString The UCI string to retrieve.
     * @param bool $autoBool If set to true, converts '0' and '1' strings to boolean value.
     * @return mixed The value of the UCI string.
     */
    public function uciGet($uciString, $autoBool = true)
    {
        $uciString = escapeshellarg($uciString);
        $result = exec("uci get {$uciString}");
        if ($autoBool && ($result === "0" || $result === "1")) {
            return $result === "1";
        }

        return $result;
    }

    /**
     * Sets a value in the UCI configuration.
     *
     * @param string $settingString The UCI setting string.
     * @param mixed $value The value to set.
     * @param bool $isList If true, the value will be added to a list; otherwise, it will set the value.
     * @param bool $autoCommit If true, automatically commits the changes.
     */
    public function uciSet($settingString, $value, $isList = false, $autoCommit = true)
    {
        $settingString = escapeshellarg($settingString);
        $value = escapeshellarg($value);
        if ($value === "''" || $value === "") {
            $value = "'0'";
        }

        $command = $isList ? "uci add_list" : "uci set";
        exec("{$command} {$settingString}={$value}");
        if ($autoCommit) {
            exec("uci commit {$settingString}");
        }
    }

    /**
     * Commits changes to the UCI (Unified Configuration Interface) configuration.
     * This function applies any pending configuration changes made via uci set or uci add_list commands.
     */
    public function uciCommit()
    {
        exec("uci commit");
    }

    /**
     * Downloads a file from a specified URL and saves it to a given path.
     *
     * @param string $url The URL of the file to be downloaded.
     * @param string $savePath The path where the downloaded file should be saved.
     * @param string $flagPath The path to a flag file that is created upon successful download.
     */
    public function downloadFile($url, $savePath, $flagPath)
    {
        $url = escapeshellarg($url);
        $savePath = escapeshellarg($savePath);
        $flagPath = escapeshellarg($flagPath);
        $this->execBackground("uclient-fetch -q -T 10 -O {$savePath} {$url} && touch {$flagPath}");
    }

    /**
     * Checks if an SD card is available in the system.
     *
     * @return bool True if an SD card is available, false otherwise.
     */
    public function isSDAvailable()
    {
        $output = exec('/bin/mount | /bin/grep "on /sd" -c');

        return $output >= 1;
    }

    /**
     * Installs a dependency, optionally to an SD card.
     *
     * @param string $dependencyName The name of the dependency to install.
     * @param bool $installToSD Whether to install to the SD card (if available).
     * @return bool True if the dependency is installed successfully, false otherwise.
     */
    public function installDependency($dependencyName, $installToSD = false)
    {
        if ($installToSD && !$this->isSDAvailable()) {
            return false;
        }

        $dependencyName = escapeshellarg($dependencyName);
        if ($this->checkDependency($dependencyName)) {
            return true;
        }

        exec("opkg update");

        $destination = $installToSD ? '--dest sd' : '';
        exec("opkg install {$dependencyName} {$destination}");

        return $this->checkDependency($dependencyName);
    }

    /**
     * Retrieves the contents of a file from a URL with SSL verification.
     *
     * @param string $url The URL of the file.
     * @return string The contents of the file.
     */
    public function fileGetContentsSSL($url)
    {
        if (extension_loaded('openssl')) {
            return file_get_contents($url);
        }

        $url = escapeshellarg($url);
        return exec("uclient-fetch -q -T 10 -O - {$url}");
    }

    /**
     * Verifies a user's password against the hash in /etc/shadow.
     *
     * @param string $username The username to verify.
     * @param string $password The password to verify.
     * @return bool True if password is correct, false otherwise.
     */
    public function verifyPassword($username, $password)
    {
        $shadowContents = file_get_contents('/etc/shadow');
        if ($shadowContents === false) {
            return false;
        }

        $pattern = sprintf('/%s:([^:]*):/', preg_quote($username, '/'));
        if (preg_match($pattern, $shadowContents, $matches) && !empty($matches[1])) {
            $hashedPassword = $matches[1];
            return hash_equals($hashedPassword, crypt($password, $hashedPassword));
        }

        return false;
    }
}
