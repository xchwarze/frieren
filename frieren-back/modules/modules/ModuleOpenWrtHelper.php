<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\modules;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    /**
     * Get the size of a local module folder.
     *
     * @param string $moduleFolder The path to the module folder.
     * @throws \Exception Error getting size of module
     * @return string The size of the module folder.
     */
    public static function getLocalModuleSize($moduleFolder)
    {
        $size = OpenWrtHelper::exec("du -sh " . escapeshellarg($moduleFolder) . " | awk '{print $1;}'");
        if ($size === false) {
            throw new \Exception("Error getting size of module {$moduleFolder}");
        }

        return $size;
    }

    /**
     * Get sizes of all module subdirectories in a single du call.
     *
     * @param string $modulesRoot The root modules directory.
     * @return array Associative array of module name => size string.
     */
    public static function getAllModuleSizes($modulesRoot)
    {
        $output = OpenWrtHelper::exec("du -sh " . escapeshellarg($modulesRoot) . "/*/", false);
        if (!$output) {
            return [];
        }

        $sizes = [];
        foreach ($output as $line) {
            $parts = preg_split('/\s+/', $line, 2);
            if (count($parts) === 2) {
                $sizes[basename(rtrim($parts[1], '/'))] = $parts[0];
            }
        }

        return $sizes;
    }
}
