<?php

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
    'frieren\\helper\\OpenWrtHelper' => __DIR__ . '/helper/OpenWrtHelper.php',
    'frieren\\orm\\SQLite' => __DIR__ . '/orm/SQLite.php',
];

spl_autoload_register(function ($className) {
    global $classMap;
    if (isset($classMap[$className])) {
        require_once $classMap[$className];
    }
});

$api = new frieren\core\ApiCore();
$api->handleRequest();
