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
     * List the module subdirectories under a modules root, mirroring what
     * `ModulesController::getModuleList()`/`getInstalledModules()` used to scan
     * directly via `new \DirectoryIterator(...)`. That was a class instantiation
     * rather than a global function call, so it couldn't be intercepted by
     * php-mock like every other OS-touching call in this codebase (TODO-1.5.md
     * M13) — `is_readable()`/`glob()` here are both unqualified global functions
     * and can be mocked in this file's namespace the same way.
     *
     * @param string $modulesRoot The root modules directory.
     * @return string[]|false Absolute paths to each module subdirectory (symlinks
     *                        to directories included, matching DirectoryIterator's
     *                        prior behavior for SD-mounted modules), or false if
     *                        the root isn't readable.
     */
    public static function getModuleFolders($modulesRoot)
    {
        if (!is_readable($modulesRoot)) {
            return false;
        }

        return glob("{$modulesRoot}/*", GLOB_ONLYDIR) ?: [];
    }

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
