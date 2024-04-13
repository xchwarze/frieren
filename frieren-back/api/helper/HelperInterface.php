<?php

namespace frieren\helper;

interface HelperInterface
{
    /**
     * Executes a shell command, returning its output or false if it fails.
     *
     * @param string $command Command to execute.
     * @return string|false Output as string on success, or false on failure.
     */
    public static function exec(string $command);

    /**
     * Executes a command in the background.
     *
     * @param string $command The command to execute.
     * @return mixed The result of the command execution.
     */
    public static function execBackground(string $command);

    /**
     * Checks if a specific process is running.
     *
     * @param string $processName The name of the process to check.
     * @param bool $isFullPath Set to true to check using the full path of the process.
     * @return bool True if the process is running, false otherwise.
     */
    public static function checkRunning(string $processName, bool $isFullPath = false): bool;

    /**
     * Checks if a dependency is installed.
     *
     * @param string $dependencyName The name of the dependency to check.
     * @return bool True if the dependency is installed, false otherwise.
     */
    public static function checkDependency(string $dependencyName): bool;

    /**
     * Retrieves a value from the UCI (Unified Configuration Interface).
     *
     * @param string $uciString The UCI string to retrieve.
     * @param bool $autoBool If set to true, converts '0' and '1' strings to boolean value.
     * @return mixed The value of the UCI string.
     */
    public static function uciGet(string $uciString, bool $autoBool = true);

    /**
     * Sets a value in the UCI configuration.
     *
     * @param string $settingString The UCI setting string.
     * @param mixed $value The value to set.
     * @param bool $isList If true, the value will be added to a list; otherwise, it will set the value.
     * @param bool $autoCommit If true, automatically commits the changes.
     */
    public static function uciSet(string $settingString, $value, bool $isList = false, bool $autoCommit = true);

    /**
     * Commits changes to the UCI (Unified Configuration Interface) configuration.
     * This function applies any pending configuration changes made via uci set or uci add_list commands.
     */
    public static function uciCommit();

    /**
     * Downloads a file from a specified URL and saves it to a given path.
     *
     * @param string $url The URL of the file to be downloaded.
     * @param string $savePath The path where the downloaded file should be saved.
     * @param string $flagPath The path to a flag file that is created upon successful download.
     */
    public static function downloadFile(string $url, string $savePath, string $flagPath);

    /**
     * Checks if an SD card is available in the system.
     *
     * @return bool True if an SD card is available, false otherwise.
     */
    public static function isSDAvailable(): bool;

    /**
     * Installs a dependency, optionally to an SD card.
     *
     * @param string $dependencyName The name of the dependency to install.
     * @param bool $installToSD Whether to install to the SD card (if available).
     * @return bool True if the dependency is installed successfully, false otherwise.
     */
    public static function installDependency(string $dependencyName, bool $installToSD = false): bool;

    /**
     * Retrieves the contents of a file from a URL with SSL verification.
     *
     * @param string $url The URL of the file.
     * @return string The contents of the file.
     */
    public static function fileGetContentsSSL(string $url);

    /**
     * Verifies a user's password against the hash in /etc/shadow.
     *
     * @param string $username The username to verify.
     * @param string $password The password to verify.
     * @return bool True if password is correct, false otherwise.
     */
    public static function verifyPassword(string $username, string $password): bool;

    /**
     * Executes a ubus call with the given command and returns the parsed response as an associative array.
     *
     * @param string $command The command to be executed.
     * @return mixed|false The parsed response as an associative array if the JSON decoding is successful, false otherwise.
     */
    public static function execUbusCall(string $command);
}
