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
     * Executes a shell command, returning its output or false if it fails.
     *
     * @param string $command The command to be executed.
     * @param bool $merge Whether to merge the output into a single string. Default is true.
     * @return array|false|string The output of the command. If $merge is true, the output will be a single string. Otherwise, it will be an array of lines.
     */
    public static function exec($command, $merge = true)
    {
        //$command = escapeshellcmd($command);
        exec($command, $output, $retval);

        // Check if the command executed successfully
        if ($retval !== 0) {
            return false;
        }

        if ($merge) {
            return implode("\n", $output);
        }

        return $output;
    }

    /**
     * Executes a command in the background.
     *
     * @param string $command The command to execute.
     * @return mixed The result of the command execution.
     */
    public static function execBackground($command)
    {
        // the use of escapeshellarg() can break the command in this context
        exec("echo \"{$command}\" | /usr/bin/at now");
        //exec("{$command} > /dev/null 2>&1 &");
    }

    /**
     * Checks if a specific process is running.
     *
     * @param string $processName The name of the process to check.
     * @param bool $isFullPath Set to true to check using the full path of the process.
     * @return bool True if the process is running, false otherwise.
     */
    public static function checkRunning($processName, $isFullPath = false)
    {
        $processName = escapeshellarg($processName);
        $command = $isFullPath ? '/usr/bin/pgrep -f' : '/usr/bin/pgrep';
        exec("{$command} {$processName}", $output);

        return count($output) > 0;
    }

    /**
     * Checks if a command is available in the system's PATH.
     *
     * @param string $commandName The name of the command to check.
     * @return bool True if the command exists, false otherwise.
     */
    public static function commandExists($commandName)
    {
        $commandName = escapeshellarg($commandName);
        exec("/usr/bin/which {$commandName}", $output);

        return !empty($output);
    }

    /**
     * Check if the given dependencies are installed.
     *
     * @param array $dependencies The list of dependencies to check.
     * @return string|bool Returns a string listing missing dependencies or true if all dependencies are installed.
     */
    public static function checkDependency($dependencies)
    {
        $output = self::exec('opkg list-installed');
        $missingDependencies = [];
        foreach ($dependencies as $dependency) {
            if (strpos($output, "{$dependency} -") === false) {
                $missingDependencies[] = $dependency;
            }
        }

        if (!empty($missingDependencies)) {
            return 'Missing dependencies: ' . implode(', ', $missingDependencies);
        }

        return true;
    }

    /**
     * Install dependencies using dependency-installer.sh script.
     *
     * @param mixed $dependencies The dependencies to install.
     * @param bool $installToSD Flag indicating whether to install to SD card.
     * @return bool
     * @throws \Exception Installation in progress. Please wait until the current installation is finished.
     */
    public static function installDependency($dependencies, $installToSD = false) {
        if (file_exists('/tmp/fm-dependencies.flag')) {
            throw new \Exception('Installation in progress. Please wait until the current installation is finished.');
        }

        if (!empty($dependencies)) {
            $scriptPath = \DeviceConfig::MODULE_ROOT_FOLDER . '/modules/bin/dependency-installer.sh';
            $sdFlag = $installToSD ? 1 : 0;
            $command = sprintf("%s install --sd %d --deps '%s'", $scriptPath, $sdFlag, escapeshellarg($dependencies));
            self::execBackground($command);
        }

        return true;
    }

    /**
     * Parses a UCI config file into an array.
     *
     * @param string $configName Config file name without extension.
     * @return array Parsed config data.
     * @throws \Exception If file does not exist.
     */
    public static function uciReadConfig($configName)
    {
        return UciConfigHelper::readConfig($configName);
    }

    /**
     * Retrieves a value from the UCI (Unified Configuration Interface).
     *
     * @param string $uciString The UCI string to retrieve.
     * @return mixed The value of the UCI string, with 'TRUE'/'FALSE' converted to boolean values, and 'UNSET' treated as null.
     */
    public static function uciGet($uciString)
    {
        return UciConfigHelper::uciGet($uciString);
    }

    /**
     * Retrieves and deserializes a JSON value from UCI.
     *
     * @param string $uciString The UCI string to retrieve.
     * @return mixed The deserialized JSON value.
     */
    public static function uciGetJson($uciString)
    {
        return UciConfigHelper::uciGetJson($uciString);
    }

    /**
     * Sets a value in the UCI configuration.
     *
     * @param string $settingString The UCI setting string.
     * @param mixed $value The value to set.
     * @param bool $isList If true, the value will be added to a list; otherwise, it will set the value.
     * @param bool $autoCommit If true, automatically commits the changes.
     */
    public static function uciSet($settingString, $value, $isList = false, $autoCommit = true)
    {
        UciConfigHelper::uciSet($settingString, $value, $isList, $autoCommit);
    }

    /**
     * Serializes a value to JSON and sets it in UCI.
     *
     * @param string $settingString The UCI setting string.
     * @param mixed $value The value to be serialized and set.
     * @param bool $autoCommit If true, automatically commits the changes.
     */
    public static function uciSetJson($settingString, $value, $autoCommit = true)
    {
        UciConfigHelper::uciSetJson($settingString, $value, $autoCommit);
    }

    /**
     * Commits changes to the UCI (Unified Configuration Interface) configuration.
     * This function applies any pending configuration changes made via uci set or uci add_list commands.
     */
    public static function uciCommit()
    {
        UciConfigHelper::uciCommit();
    }

    /**
     * Downloads a file from a specified URL and saves it to a given path.
     *
     * @param string $url The URL of the file to be downloaded.
     * @param string $savePath The path where the downloaded file should be saved.
     * @param string $flagPath The path to a flag file that is created upon successful download.
     */
    public static function downloadFile($url, $savePath, $flagPath)
    {
        $url = escapeshellarg($url);
        $savePath = escapeshellarg($savePath);
        $flagPath = escapeshellarg($flagPath);
        self::execBackground("uclient-fetch -q -T 10 -O {$savePath} {$url} && touch {$flagPath}");
    }

    /**
     * Checks if an SD card is available in the system.
     *
     * @return bool True if an SD card is available, false otherwise.
     */
    public static function isSDAvailable()
    {
        $output = exec('/bin/mount | /bin/grep "on /sd" -c');

        return $output >= 1;
    }

    /**
     * Retrieves the contents of a file from a URL with SSL verification.
     *
     * @param string $url The URL of the file.
     * @return string The contents of the file.
     */
    public static function fileGetContentsSSL($url)
    {
        if (extension_loaded('openssl')) {
            return file_get_contents($url);
        }

        $url = escapeshellarg($url);
        return self::exec("uclient-fetch -q -T 10 -O - {$url}");
    }

    /**
     * Verifies a user's password against the hash in /etc/shadow.
     *
     * @param string $username The username to verify.
     * @param string $password The password to verify.
     * @return bool True if password is correct, false otherwise.
     */
    public static function verifyPassword($username, $password)
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

    /**
     * Executes an ubus call with the given command and returns the parsed response as an associative array.
     *
     * @param string $command The command to be executed.
     * @return mixed|false The parsed response as an associative array if the JSON decoding is successful, false otherwise.
     */
    public static function execUbusCall($command)
    {
        //$command = escapeshellarg($command);
        $resume = self::exec("ubus call {$command}");
        $parsed = json_decode($resume, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $parsed;
        }

        return false;
    }
}
