<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\modules\modules;

use frieren\helper\OpenWrtHelper;

class ModuleOpenWrtHelper
{
    /**
     * Get sizes of all module subdirectories in a single du call.
     *
     * @param string $modulesRoot The root modules directory.
     * @return array Associative array of module name => size string.
     */
    public static function getAllModuleSizes($modulesRoot)
    {
        $command = "du -sh " . escapeshellarg($modulesRoot) . "/*/";
        $output = OpenWrtHelper::exec($command, false, true);
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
