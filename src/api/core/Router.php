<?php

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
        if (isset($this->request['module']) && !empty($this->request['module'])) {
            $moduleInstance = $this->loadModule($this->request['module']);

            return $moduleInstance->getResponseHandler();
        }
    
        throw new \Exception("No valid module has been specified.");
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
        session_write_close();

        //$moduleFilePath = "/frieren/modules/{$moduleName}/api/module.php";
        $moduleFilePath = __DIR__ . "/../../modules/{$moduleName}/api/module.php";
        if (!file_exists($moduleFilePath)) {
            throw new \Exception("Module file for {$moduleName} does not exist.");
        }

        require_once($moduleFilePath);

        $moduleClass = "frieren\\core\\{$moduleName}";
        if (!class_exists($moduleClass)) {
            throw new \Exception("The class {$moduleClass} does not exist in the module file.");
        }

        return new $moduleClass($this->request);
    }
}
