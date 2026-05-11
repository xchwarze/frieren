<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\core;

/**
 * Handles routing of requests to appropriate modules.
 */
class Router {
    /**
     * @var array The request data.
     */
    private $request;

    /**
     * Constructor for Router.
     *
     * @param array $request The request data.
     */
    public function __construct($request) {
        $this->request = $request;
    }

    /**
     * Routes the request to the appropriate module based on request data.
     *
     * @return mixed The response from the routed module.
     * @throws \Exception if the module is not specified or cannot be loaded.
     */
    public function routeModule() {
        $module = $this->request['module'] ?? '';
        if (empty($module) || !preg_match('/^[a-z0-9_]+$/i', $module)) {
            throw new \Exception('No valid module has been specified.');
        }

        return $this->loadModule($module)->getResponseHandler();
    }

    /**
     * Loads a module and executes its route method.
     *
     * @param string $moduleName The name of the module to load.
     * @return mixed The instance of the module class.
     * @throws \Exception if the module file or class does not exist.
     */
    private function loadModule($moduleName)
    {
        $baseDir = \DeviceConfig::MODULE_ROOT_FOLDER;
        $controllerName = ucfirst($moduleName) . 'Controller';

        $moduleFilePath = "{$baseDir}/{$moduleName}/{$controllerName}.php";
        //$moduleRealPath = realpath($moduleFilePath);
        //if (!$moduleRealPath || strpos($moduleRealPath, $baseDir) !== 0) {
        if (!file_exists($moduleFilePath)) {
            throw new \Exception("Module file for '{$moduleName}' does not exist.");
        }

        require($moduleFilePath);
        $moduleClass = "frieren\\modules\\{$moduleName}\\{$controllerName}";
        if (!class_exists($moduleClass, false)) {
            throw new \Exception("The class {$moduleClass} does not exist in the module file.");
        }

        return new $moduleClass($this->request, $moduleName);
    }
}
