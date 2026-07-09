<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\helper;

/**
 * Handles reading and parsing UCI config files in OpenWRT.
 */
class UciConfigHelper
{
    const CONFIG_PATH = '/etc/config/';

    /**
     * Parses a UCI config file into an array.
     *
     * @param string $configName Config file name without extension.
     * @return array Parsed config data.
     * @throws \Exception If file does not exist.
     */
    public static function readConfig($configName)
    {
        $filePath = self::CONFIG_PATH . $configName;
        if (!file_exists($filePath)) {
            throw new \Exception("Configuration file does not exist: {$filePath}");
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        return self::parseLines($lines);
    }

    /**
     * Parses UCI config lines into a sections array. Named sections (quoted or
     * bare) are keyed by their name; anonymous sections are keyed @type[i],
     * where i counts anonymous sections of that type in file order.
     *
     * @param array $lines Config file lines without trailing newlines.
     * @return array Parsed config data keyed by section.
     */
    private static function parseLines($lines)
    {
        $config = [];
        $currentSectionKey = null;
        $sectionCounter = [];

        foreach ($lines as $line) {
            $trimmed = ltrim($line);

            // Ignore blank lines and comments
            if ($trimmed === '' || $trimmed[0] === '#') {
                continue;
            }

            $keyword = $trimmed[0];

            // Section: `config <type> [ 'name' | "name" | name ]`. The type may
            // contain hyphens (e.g. wifi-device); the name, when present, may be
            // single/double quoted or a bare identifier.
            if ($keyword === 'c' && preg_match('/^config\s+(\S+)(?:\s+(?:"([^"]*)"|\'([^\']*)\'|(\w+)))?/', $trimmed, $matches)) {
                $currentSectionKey = self::parseConfig($matches, $config, $sectionCounter);
                continue;
            }

            // Option support
            if ($keyword === 'o' && preg_match('/^option\s+(\w+)\s+(.*)$/', $trimmed, $matches)) {
                self::parseOption($matches, $config[$currentSectionKey]);
                continue;
            }

            // List support
            if ($keyword === 'l' && preg_match('/^list\s+(\w+)\s+(.*)$/', $trimmed, $matches)) {
                self::parseList($matches, $config[$currentSectionKey]);
                continue;
            }
        }

        return $config;
    }

    /**
     * Parses a config section from the UCI config file.
     *
     * @param array $matches The regex matches.
     * @param array &$config The full configuration array being built.
     * @param array &$sectionCounter A counter for unnamed sections.
     */
    private static function parseConfig($matches, &$config, &$sectionCounter)
    {
        $type = $matches[1];

        // Name is whichever of the double-quoted / single-quoted / bare capture
        // groups matched; empty string means the section is anonymous.
        $name = '';
        foreach ([2, 3, 4] as $group) {
            if (isset($matches[$group]) && $matches[$group] !== '') {
                $name = $matches[$group];
                break;
            }
        }

        if ($name === '') {
            if (!isset($sectionCounter[$type])) {
                $sectionCounter[$type] = -1;
            }
            $sectionCounter[$type]++;
            $name = '@' . $type . '[' . $sectionCounter[$type] . ']';
        }

        $config[$name] = [];

        return $name;
    }

    /**
     * Parses an option from the UCI config file.
     *
     * @param array $matches The regex matches.
     * @param array $currentSection The current section being processed.
     */
    private static function parseOption($matches, &$currentSection)
    {
        if ($currentSection === null) {
            throw new \Exception('Option found outside of a config section.');
        }

        $optionName = $matches[1];
        $optionValue = trim($matches[2], "'\"");
        $currentSection[$optionName] = self::convertSpecialValues($optionValue);
    }

    /**
     * Parses a list from the UCI config file.
     *
     * @param array $matches The regex matches.
     * @param array $currentSection The current section being processed.
     */
    private static function parseList($matches, &$currentSection)
    {
        if ($currentSection === null) {
            throw new \Exception('List found outside of a config section.');
        }

        $listName = $matches[1];
        $listValue = trim($matches[2], "'\"");

        // Ensure the option is treated as an array
        if (!isset($currentSection[$listName])) {
            $currentSection[$listName] = [];
        }
        $currentSection[$listName][] = self::convertSpecialValues($listValue);
    }

    /**
     * Converts special values to their corresponding PHP types.
     *
     * @param mixed $value The value to be converted.
     * @return mixed The converted value.
     */
    private static function convertSpecialValues($value)
    {
        switch ($value) {
            case 'TRUE':
                return true;
            case 'FALSE':
                return false;
            case 'UNSET':
                return null;
            default:
                return $value;
        }
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
        $escaped = escapeshellarg($uciString);
        $ret = exec("uci -q get {$escaped}", $output, $exitCode);
        if ($exitCode !== 0) {
            if ($throwOnError) {
                throw new \Exception("Failed to get UCI setting: {$uciString}");
            }

            return null;
        }

        return self::convertSpecialValues($ret);
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
        if (is_bool($value)) {
            $value = $value ? "'TRUE'" : "'FALSE'";
        } else if ($value === "" || is_null($value)) {
            $value = "'UNSET'";
        } else {
            $value = escapeshellarg($value);
        }

        $command = $isList ? "uci add_list" : "uci set";
        $settingString = escapeshellarg($settingString);
        exec("{$command} {$settingString}={$value}", $output, $exitCode);
        if ($exitCode !== 0) {
            throw new \Exception("Failed to set UCI setting: {$settingString}={$value}");
        }

        if ($autoCommit) {
            exec("uci commit {$settingString}");
        }
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
        $result = self::uciGet($uciString, $throwOnError);
        $decodedResult = json_decode($result, true);

        return $decodedResult !== null || $result === 'null' ? $decodedResult : [];
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
        $jsonValue = json_encode($value);
        self::uciSet($settingString, $jsonValue, false, $autoCommit);
    }

    /**
     * Commits changes to the UCI (Unified Configuration Interface) configuration.
     * This function applies any pending configuration changes made via uci set or uci add_list commands.
     */
    public static function uciCommit()
    {
        exec("uci commit");
    }
}
