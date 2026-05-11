<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\packages;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const SCRIPT_PATH = '/bin/package-manager-call';

    const UPDATE_FLAG = '/tmp/opkgUpdateDone';
    const UPDATE_OUTPUT = '/tmp/opkgUpdateOutput.log';
    const INSTALLED_FLAG = '/tmp/opkgInstalledDone';
    const INSTALLED_OUTPUT = '/tmp/opkgInstalledOutput.log';
    const AVAILABLE_FLAG = '/tmp/opkgAvailableDone';
    const AVAILABLE_OUTPUT = '/tmp/opkgAvailableOutput.log';
    const INSTALL_FLAG = '/tmp/opkgInstallDone';
    const INSTALL_OUTPUT = '/tmp/opkgInstallOutput.log';
    const REMOVE_FLAG = '/tmp/opkgRemoveDone';
    const REMOVE_OUTPUT = '/tmp/opkgRemoveOutput.log';

    private static function getScriptPath()
    {
        return \DeviceConfig::MODULE_ROOT_FOLDER . '/packages' . self::SCRIPT_PATH;
    }

    private static function runBackground($command, $outputFile, $flagFile)
    {
        @unlink($flagFile);
        @unlink($outputFile);
        OpenWrtHelper::execBackground(
            "sh -c \"{$command} > {$outputFile} 2>&1; touch {$flagFile}\""
        );
    }

    private static function getBackgroundStatus($flagFile, $outputFile)
    {
        return [
            'completed' => file_exists($flagFile),
            'output' => @file_get_contents($outputFile) ?: '',
        ];
    }

    public static function updateLists()
    {
        $script = self::getScriptPath();
        self::runBackground(
            "/bin/sh {$script} update",
            self::UPDATE_OUTPUT,
            self::UPDATE_FLAG
        );
    }

    public static function getUpdateStatus()
    {
        return self::getBackgroundStatus(self::UPDATE_FLAG, self::UPDATE_OUTPUT);
    }

    public static function listInstalledPackages()
    {
        $script = self::getScriptPath();
        $outputFile = self::INSTALLED_OUTPUT;
        OpenWrtHelper::exec("/bin/sh {$script} list-installed > {$outputFile} 2>&1");

        return [
            'packages' => self::parsePackageFile($outputFile),
        ];
    }

    public static function getInstalledPackagesStatus()
    {
        $completed = file_exists(self::INSTALLED_FLAG);

        return [
            'completed' => $completed,
            'packages' => $completed ? self::parsePackageFile(self::INSTALLED_OUTPUT) : [],
        ];
    }

    public static function listAvailablePackages()
    {
        $script = self::getScriptPath();
        self::runBackground(
            "/bin/sh {$script} list-available",
            self::AVAILABLE_OUTPUT,
            self::AVAILABLE_FLAG
        );
    }

    public static function getAvailablePackagesStatus()
    {
        $completed = file_exists(self::AVAILABLE_FLAG);

        return [
            'completed' => $completed,
            'packages' => $completed ? self::parsePackageFile(self::AVAILABLE_OUTPUT) : [],
        ];
    }

    public static function installPackage($packageName)
    {
        $script = self::getScriptPath();
        self::runBackground(
            "/bin/sh {$script} install {$packageName}",
            self::INSTALL_OUTPUT,
            self::INSTALL_FLAG
        );
    }

    public static function getInstallStatus()
    {
        return self::getBackgroundStatus(self::INSTALL_FLAG, self::INSTALL_OUTPUT);
    }

    public static function removePackage($packageName)
    {
        $script = self::getScriptPath();
        self::runBackground(
            "/bin/sh {$script} remove {$packageName}",
            self::REMOVE_OUTPUT,
            self::REMOVE_FLAG
        );
    }

    public static function getRemoveStatus()
    {
        return self::getBackgroundStatus(self::REMOVE_FLAG, self::REMOVE_OUTPUT);
    }

    /**
     * Parses a package list file from package-manager-call output.
     * Uses line-by-line reading to stay within OpenWrt's 8MB memory limit.
     * Supports opkg control-file format and APK list format.
     *
     * @param string $filePath Path to the output file.
     * @return array Array of ['name' => ..., 'version' => ..., 'description' => ...].
     */
    public static function parsePackageFile($filePath)
    {
        if (!file_exists($filePath)) {
            return [];
        }

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            return [];
        }

        $firstLine = fgets($handle);
        rewind($handle);

        if ($firstLine !== false && strncmp(ltrim($firstLine), 'Package:', 8) === 0) {
            $packages = self::parseControlFile($handle);
        } else {
            $packages = self::parseApkFile($handle);
        }

        fclose($handle);

        return $packages;
    }

    private static function parseControlFile($handle)
    {
        $packages = [];
        $name = $version = $description = '';

        while (($line = fgets($handle)) !== false) {
            if ($line === "\n" || $line === "\r\n") {
                if ($name !== '') {
                    $packages[] = [
                        'name' => $name,
                        'version' => $version,
                        'description' => $description,
                    ];
                    $name = $version = $description = '';
                }
                continue;
            }

            switch ($line[0]) {
                case 'P':
                    if (strncmp($line, 'Package: ', 9) === 0) {
                        $name = rtrim(substr($line, 9));
                    }
                    break;
                case 'V':
                    if (strncmp($line, 'Version: ', 9) === 0) {
                        $version = rtrim(substr($line, 9));
                    }
                    break;
                case 'D':
                    if (strncmp($line, 'Description: ', 13) === 0) {
                        $description = rtrim(substr($line, 13));
                    }
                    break;
            }
        }

        if ($name !== '') {
            $packages[] = [
                'name' => $name,
                'version' => $version,
                'description' => $description,
            ];
        }

        return $packages;
    }

    private static function parseApkFile($handle)
    {
        $packages = [];

        while (($line = fgets($handle)) !== false) {
            if (preg_match('/^(\S+?)-(\d\S*)\s+/', $line, $m)) {
                $description = '';
                $nextLine = fgets($handle);
                if ($nextLine !== false && ($nextLine[0] === ' ' || $nextLine[0] === "\t")) {
                    $description = trim($nextLine);
                }

                $packages[] = [
                    'name' => $m[1],
                    'version' => $m[2],
                    'description' => $description,
                ];
            }
        }

        return $packages;
    }
}
