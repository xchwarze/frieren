<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\packages;

use frieren\helper\BackgroundTaskHelper;
use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    const SCRIPT_PATH = '/bin/package-manager-call.sh';

    const TASK_UPDATE = 'opkg-update';
    const TASK_INSTALLED = 'opkg-installed';
    const TASK_AVAILABLE = 'opkg-available';
    const TASK_INSTALL = 'opkg-install';
    const TASK_REMOVE = 'opkg-remove';

    private static function getScriptPath()
    {
        return \DeviceConfig::MODULE_ROOT_FOLDER . '/packages' . self::SCRIPT_PATH;
    }

    public static function updateLists()
    {
        $script = self::getScriptPath();
        BackgroundTaskHelper::start(self::TASK_UPDATE, "/bin/sh {$script} update");
    }

    public static function getUpdateStatus()
    {
        return BackgroundTaskHelper::getStatus(self::TASK_UPDATE);
    }

    public static function listInstalledPackages()
    {
        $script = self::getScriptPath();
        $outputFile = BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED);
        OpenWrtHelper::exec("/bin/sh {$script} list-installed > {$outputFile} 2>&1");

        return [
            'packages' => self::parsePackageFile($outputFile),
        ];
    }

    public static function getInstalledPackagesStatus()
    {
        $completed = BackgroundTaskHelper::isCompleted(self::TASK_INSTALLED);

        return [
            'completed' => $completed,
            'packages' => $completed ? self::parsePackageFile(BackgroundTaskHelper::getLogPath(self::TASK_INSTALLED)) : [],
        ];
    }

    public static function listAvailablePackages()
    {
        $script = self::getScriptPath();
        BackgroundTaskHelper::start(self::TASK_AVAILABLE, "/bin/sh {$script} list-available");
    }

    public static function getAvailablePackagesStatus()
    {
        $completed = BackgroundTaskHelper::isCompleted(self::TASK_AVAILABLE);

        return [
            'completed' => $completed,
            'packages' => $completed ? self::parsePackageFile(BackgroundTaskHelper::getLogPath(self::TASK_AVAILABLE)) : [],
        ];
    }

    public static function installPackage($packageName)
    {
        $script = self::getScriptPath();
        BackgroundTaskHelper::start(self::TASK_INSTALL, "/bin/sh {$script} install {$packageName}");
    }

    public static function getInstallStatus()
    {
        return BackgroundTaskHelper::getStatus(self::TASK_INSTALL);
    }

    public static function removePackage($packageName, $autoremove = false)
    {
        $script = self::getScriptPath();
        $flags = $autoremove ? '--force-removal-of-dependent-packages --autoremove ' : '';
        BackgroundTaskHelper::start(self::TASK_REMOVE, "/bin/sh {$script} remove {$flags}{$packageName}");
    }

    public static function getRemoveStatus()
    {
        return BackgroundTaskHelper::getStatus(self::TASK_REMOVE);
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
