<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

// debug
error_reporting(E_ALL);
ini_set('display_errors', '1');

/**
 * Autoloader and Application Initializer
 *
 * Sets up a custom class autoloader mapping and initializes the ApiCore class.
 * This script is the entry point for handling HTTP requests using the Frieren framework.
 */
$classMap = [
    'DeviceConfig' => __DIR__ . '/config/config.php',
    'frieren\\core\\ApiCore' => __DIR__ . '/core/ApiCore.php',
    'frieren\\core\\Controller' => __DIR__ . '/core/Controller.php',
    'frieren\\core\\ResponseHandler' => __DIR__ . '/core/ResponseHandler.php',
    'frieren\\core\\Router' => __DIR__ . '/core/Router.php',
    'frieren\\helper\\HelperFactory' => __DIR__ . '/helper/HelperFactory.php',
    'frieren\\helper\\OpenWrtHelper' => __DIR__ . '/helper/OpenWrtHelper.php',
    'frieren\\helper\\UciConfigHelper' => __DIR__ . '/helper/UciConfigHelper.php',
    'frieren\\orm\\SQLite' => __DIR__ . '/orm/SQLite.php',
];

spl_autoload_register(function ($className) use ($classMap) {
    if (isset($classMap[$className])) {
        require $classMap[$className];
        return;
    }

    // Fallback to PSR-4 based autoloading for namespaces
    $prefix = 'frieren\modules\\';
    $len = 16; //strlen($prefix);

    // Check if the class uses the namespace prefix
    if (strncmp($prefix, $className, $len) === 0) {
        $baseDir = __DIR__ . '/../modules/';

        $relativeClass = substr($className, $len);
        $relativeClass = str_replace('\\', '/', $relativeClass);

        require "{$baseDir}{$relativeClass}.php";
    }
});

$api = new frieren\core\ApiCore();
$api->handleRequest();
