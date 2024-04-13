<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\helper;

/**
 * Factory class to provide system-specific helper instances.
 */
class HelperFactory
{
    /**
     * Creates a helper instance based on the system family.
     *
     * @param string $systemFamily The family of the operating system (e.g., 'OpenWRT', 'Linux', 'Windows').
     * @return mixed Returns an instance of the specified system family helper.
     * @throws \Exception If the system family is unsupported.
     */
    public static function create($systemFamily) {
        switch ($systemFamily) {
            case 'OpenWrt':
                return new OpenWrtHelper();
            // TODO add others helpers
            //case 'Linux':
            //    return new LinuxHelper();
            default:
                throw new \Exception("Unsupported system family: {$systemFamily}");
        }
    }

    /**
     * Creates a module-specific helper based on the system family and module name.
     *
     * @param string $module The name of the module for which the helper is created.
     * @param string $systemFamily The family of the operating system.
     * @return mixed Returns an instance of the specified module and system family helper.
     * @throws \Exception If the helper class does not exist.
     */
    public static function createModuleHelper($module, $systemFamily) {
        $className = "\\frieren\\modules\\$module\\Module{$systemFamily}Helper";

        if (class_exists($className)) {
            return new $className();
        } else {
            throw new \Exception("Helper not found for module: {$module}, system: {$systemFamily}");
        }
    }
}
