<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

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
     * @param bool $raw If true, skips escapeshellcmd. Use for commands with pipes, redirects, or globs.
     * @return array|false|string The output of the command. If $merge is true, the output will be a single string. Otherwise, it will be an array of lines.
     */
    public static function exec($command, $merge = true, $raw = false)
    {
        if (!$raw) {
            $command = escapeshellcmd($command);
        }
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
     * @param string $redirect The file path for redirecting the command's output (default is /dev/null).
     * @return mixed The result of the command execution.
     */
    public static function execBackground($command, $redirect = '/dev/null 2>&1')
    {
        // the use of escapeshellarg() can break the command in this context
        exec("/usr/bin/nohup {$command} > {$redirect} &");
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

        return !empty($output);
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
        // Installed packages come straight from the opkg status DB via one grep,
        // instead of `opkg list-installed` which formats the whole package database.
        $statusLines = self::exec("/bin/grep -F 'Package: ' /usr/lib/opkg/status", false, true);
        $installed = [];
        foreach (is_array($statusLines) ? $statusLines : [] as $line) {
            if (strncmp($line, 'Package: ', 9) === 0) {
                $installed[trim(substr($line, 9))] = true;
            }
        }

        $missingDependencies = [];
        foreach ($dependencies as $dependency) {
            if (!isset($installed[$dependency])) {
                $missingDependencies[] = $dependency;
            }
        }

        if (!empty($missingDependencies)) {
            return 'Missing dependencies: ' . implode(', ', $missingDependencies);
        }

        return true;
    }

    /**
     * Install dependencies using the packages dependency-installer.sh script (streams output live).
     *
     * @param mixed $dependencies The dependencies to install.
     * @param bool $installToSD Flag indicating whether to install to SD card.
     * @param string $taskName Background task name used for status polling and concurrency.
     * @return bool
     */
    public static function installDependency($dependencies, $installToSD = false, $taskName = 'module-dependencies') {
        if (!empty($dependencies)) {
            $scriptPath = \DeviceConfig::MODULE_ROOT_FOLDER . '/packages/bin/dependency-installer.sh';
            $dest = $installToSD ? '--dest sd ' : '';
            $escapedDeps = implode(' ', array_map('escapeshellarg', explode(' ', $dependencies)));
            $command = sprintf('%s %s%s', $scriptPath, $dest, $escapedDeps);
            BackgroundTaskHelper::start($taskName, $command);
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
     * @param bool $throwOnError If true, throws when the entry does not exist; if false, returns null instead.
     * @return mixed The value of the UCI string, with 'TRUE'/'FALSE' converted to boolean values, and 'UNSET' treated as null. Returns null when the entry is missing and $throwOnError is false.
     */
    public static function uciGet($uciString, $throwOnError = true)
    {
        return UciConfigHelper::uciGet($uciString, $throwOnError);
    }

    /**
     * Retrieves and deserializes a JSON value from UCI.
     *
     * @param string $uciString The UCI string to retrieve.
     * @param bool $throwOnError If true, throws when the entry does not exist; if false, returns an empty array instead.
     * @return mixed The deserialized JSON value, or an empty array when the entry is missing and $throwOnError is false.
     */
    public static function uciGetJson($uciString, $throwOnError = true)
    {
        return UciConfigHelper::uciGetJson($uciString, $throwOnError);
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
     * Reads a whole UCI config through ubus (the live uci engine), returning its
     * sections keyed by their real identifier.
     *
     * Contrast with uciReadConfig(): that parses the config file with zero
     * process spawns but keys anonymous sections positionally as @type[i]; ubus
     * instead reports each section's real name and, for anonymous sections, the
     * internal cfgXXXXXX id it uses everywhere else. Use this reader (one process
     * spawn) when call sites address sections by the identity ubus reports (e.g.
     * wireless, whose wifi-iface sections may be anonymous); prefer uciReadConfig()
     * for named-only configs on a hot path.
     *
     * @param string $configName Config name (e.g. 'wireless', 'network').
     * @return array Sections keyed by name/id; empty array on failure.
     */
    public static function uciGetConfig($configName)
    {
        $result = self::execUbusCall('uci', 'get', ['config' => $configName]);

        return ($result !== false && isset($result['values'])) ? $result['values'] : [];
    }

    /**
     * Reads a single UCI section's options through ubus. See uciGetConfig() for
     * the ubus-vs-file-parser tradeoff.
     *
     * @param string $configName Config name (e.g. 'wireless').
     * @param string $section Section identifier as reported by ubus (a real name
     *                        like 'radio0'/'wifinet0', or an anonymous cfgXXXXXX id).
     * @return array The section's option map; empty array when the section is missing.
     */
    public static function uciGetSection($configName, $section)
    {
        $result = self::execUbusCall('uci', 'get', ['config' => $configName, 'section' => $section]);

        return ($result !== false && isset($result['values'])) ? $result['values'] : [];
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
        self::execBackground("/bin/uclient-fetch -q -T 10 -O {$savePath} {$url} ; touch {$flagPath}");
    }

    /**
     * Checks if an SD card is available in the system.
     *
     * @return bool True if an SD card is available, false otherwise.
     */
    public static function isSDAvailable()
    {
        return strpos(file_get_contents('/proc/mounts'), ' /sd ') !== false;
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
            // Bound the read so a slow/hung remote can't pin a worker up to the
            // default_socket_timeout (60s). 15s matches the PHP config ceiling.
            $context = stream_context_create(['http' => ['timeout' => 15]]);
            return file_get_contents($url, false, $context);
        }

        $url = escapeshellarg($url);
        return self::exec("/bin/uclient-fetch -q -T 10 -O - {$url}", true, true);
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
     * Executes an ubus call and returns the parsed JSON response.
     *
     * @param string $namespace The ubus namespace (e.g. 'iwinfo', 'network.wireless', 'system').
     * @param string $method The method to call (e.g. 'status', 'info', 'scan').
     * @param array $args Optional associative array of arguments.
     * @return mixed|false The parsed response as an associative array if the JSON decoding is successful, false otherwise.
     */
    public static function execUbusCall($namespace, $method, $args = [])
    {
        $cmd = '/bin/ubus call ' . escapeshellarg($namespace) . ' ' . escapeshellarg($method);
        if (!empty($args)) {
            $cmd .= ' ' . escapeshellarg(json_encode($args));
        }
        $result = self::exec($cmd, true, true);
        $parsed = json_decode($result, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $parsed;
        }

        return false;
    }

    /**
     * Checks internet connectivity by pinging a public DNS server.
     *
     * @return bool True if internet is reachable, false otherwise.
     */
    public static function hasInternetConnection()
    {
        // -c2: tolerate a single dropped packet. ping exits 0 if AT LEAST ONE of the two
        // replies arrives, so one good reply is enough to count as online.
        $result = self::exec('/bin/ping -c2 -W2 1.1.1.1');

        return $result !== false;
    }

    /**
     *
     * @param string $message The message to log.
     * @param string $level The severity level of the log ('emerg', 'alert', 'crit', 'err',
     *                       'warning', 'notice', 'info', 'debug'). Default is 'err'.
     * @return null|false Null if the command executes successfully, false if it fails.
     */
    public static function logger($message, $level = 'err')
    {
        $validLevels = ['emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'];
        if (!in_array($level, $validLevels, true)) {
            $level = 'err';
        }

        $message = escapeshellarg($message);
        return self::exec("/usr/bin/logger -p user.{$level} {$message}", true, true);
    }
}
