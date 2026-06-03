<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\helper;

interface HelperInterface
{
    /**
     * Executes a shell command, returning its output or false if it fails.
     *
     * @param string $command Command to execute.
     * @return string|false Output as string on success, or false on failure.
     */
    public static function exec($command);

    /**
     * Executes a command in the background.
     *
     * @param string $command The command to execute.
     * @return mixed The result of the command execution.
     */
    public static function execBackground($command);

    /**
     * Checks if a specific process is running.
     *
     * @param string $processName The name of the process to check.
     * @param bool $isFullPath Set to true to check using the full path of the process.
     * @return bool True if the process is running, false otherwise.
     */
    public static function checkRunning($processName, $isFullPath = false);

    /**
     * Checks if the given dependencies are installed.
     *
     * @param array $dependencies List of dependency names to check.
     * @return string|bool A message listing missing dependencies, or true if all are installed.
     */
    public static function checkDependency($dependencies);

    /**
     * Retrieves a value from the UCI (Unified Configuration Interface).
     *
     * @param string $uciString The UCI string to retrieve.
     * @param bool $throwOnError If true, throws when the entry does not exist; if false, returns null instead.
     * @return mixed The value of the UCI string, or null when the entry is missing and $throwOnError is false.
     */
    public static function uciGet($uciString, $throwOnError = true);

    /**
     * Sets a value in the UCI configuration.
     *
     * @param string $settingString The UCI setting string.
     * @param mixed $value The value to set.
     * @param bool $isList If true, the value will be added to a list; otherwise, it will set the value.
     * @param bool $autoCommit If true, automatically commits the changes.
     */
    public static function uciSet($settingString, $value, $isList = false, $autoCommit = true);

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
    public static function downloadFile($url, $savePath, $flagPath);

    /**
     * Checks if an SD card is available in the system.
     *
     * @return bool True if an SD card is available, false otherwise.
     */
    public static function isSDAvailable();

    /**
     * Installs a dependency, optionally to an SD card.
     *
     * @param string $dependencies Space-separated list of dependencies to install.
     * @param bool $installToSD Whether to install to the SD card (if available).
     * @param string $taskName Background task name used for status polling and concurrency.
     * @return bool True if the dependency is installed successfully, false otherwise.
     */
    public static function installDependency($dependencies, $installToSD = false, $taskName = 'module-dependencies');

    /**
     * Retrieves the contents of a file from a URL with SSL verification.
     *
     * @param string $url The URL of the file.
     * @return string The contents of the file.
     */
    public static function fileGetContentsSSL($url);

    /**
     * Verifies a user's password against the hash in /etc/shadow.
     *
     * @param string $username The username to verify.
     * @param string $password The password to verify.
     * @return bool True if password is correct, false otherwise.
     */
    public static function verifyPassword($username, $password);

    /**
     * Executes a ubus call with the given command and returns the parsed response as an associative array.
     *
     * @param string $namespace The ubus namespace (e.g. 'iwinfo', 'network.wireless', 'system').
     * @param string $method The method to call (e.g. 'status', 'info', 'scan').
     * @param array $args Optional associative array of arguments.
     * @return mixed|false The parsed response as an associative array if the JSON decoding is successful, false otherwise.
     */
    public static function execUbusCall($namespace, $method, $args = []);
}
