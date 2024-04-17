<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\core;

/**
 * Abstract base class for module controllers.
 */
abstract class Controller
{
    /**
     * Minimum required disk space in bytes.
     */
    const MIN_DISK_SPACE = 786432;

    /**
     * @var string The loaded module name.
     */
    protected $moduleName;

    /**
     * @var array The request data.
     */
    protected $request;

    /**
     * @var ResponseHandler Handler for building and sending responses.
     */
    protected $responseHandler;

    /**
     * @var mixed The core system helper instance, dynamically determined based on the operating system family.
     */
    protected $coreHelper;

    /**
     * @var mixed The module-specific helper instance, dynamically determined based on the module and operating system family.
     */
    protected $moduleHelper;

    /**
     * @var array List of valid endpoint route actions.
     */
    protected $endpointRoutes = [];

    /**
     * Constructor for Controller.
     *
     * @param array $request Data of the incoming request.
     * @param string $moduleName Name of the module being handled by this controller.
     */
    public function __construct($request, $moduleName)
    {
        $this->request = $request;
        $this->moduleName = $moduleName;
        $this->responseHandler = new ResponseHandler();
        $this->handleActions();
    }

    /**
     * Routes request to a method based on 'action'. Sets error for missing or unknown actions.
     *
     * @return mixed Result of the action method or error response.
     */
    protected function handleActions()
    {
        if (!isset($this->request['action'])) {
            return self::setError('No action was specified');
        }

        if (in_array($this->request['action'], $this->endpointRoutes)) {
            $content = $this->{$this->request['action']}();
            session_write_close();
            return $content;
        }

        return self::setError('Unknown action');
    }

    /**
     * Sets up the core helper based on the operating system family.
     *
     * @return object The instance of the core-specific helper.
     * @throws \Exception If the core helper cannot be created.
     */
    protected function setupCoreHelper() {
        $this->coreHelper = \frieren\helper\HelperFactory::create(\DeviceConfig::GUESS_TYPE);

        return $this->coreHelper;
    }

    /**
     * Sets up the module helper based on the operating system family and module name.
     *
     * @return object The instance of the module-specific helper.
     * @throws \Exception If the module helper cannot be created.
     */
    protected function setupModuleHelper() {
        $this->moduleHelper = \frieren\helper\HelperFactory::createModuleHelper($this->moduleName, \DeviceConfig::GUESS_TYPE);

        return $this->moduleHelper;
    }

    /**
     * Retrieves the path of the current module.
     *
     * @return string The path of the module.
     */
    protected function getModulePath() {
        return \DeviceConfig::MODULE_ROOT_FOLDER . '/' . $this->moduleName;
    }

    /**
     * Get the module manifest by decoding the JSON content of the manifest file.
     *
     * @return array The decoded JSON content of the module manifest.
     */
    protected function getModuleManifest() {
        $modulePath = $this->getModulePath();

        return json_decode(file_get_contents("{$modulePath}/manifest.json"), true);
    }

    /**
     * Check module dependencies by verifying if all required modules are installed.
     *
     * @return true The function sets success status with details on dependency fulfillment and storage availability.
     */
    public function checkModuleDependencies() {
        $manifest = $this->getModuleManifest();
        $dependencies = $manifest['dependencies'] ?? false;
        if (!empty($dependencies)) {
            $check = self::setupCoreHelper()::checkDependency($dependencies);
            if (is_string($check)) {
                return self::setSuccess([
                    'hasDependencies' => false,
                    'message' => $check,
                    'internalAvailable' => (disk_free_space('/') > self::MIN_DISK_SPACE) && \DeviceConfig::MODULE_USE_INTERNAL_STORAGE,
                    'SDAvailable' => self::setupCoreHelper()::isSDAvailable() && \DeviceConfig::MODULE_USE_USB_STORAGE,
                ]);
            }
        }

        return self::setSuccess(['hasDependencies' => true]);
    }

    /**
     * Install module dependencies using dependency-installer.sh script.
     *
     * @return true A ResponseHandler object with the standard response.
     */
    public function installModuleDependencies() {
        $manifest = $this->getModuleManifest();
        $dependencies = implode(' ', $manifest['dependencies'] ?? false);
        if (!empty($dependencies)) {
            $installToSD = $this->request['destination'] === 'sd';
            self::setupCoreHelper()::installDependency($dependencies, $installToSD);
            return self::setSuccess();
        }

        return self::setError();
    }

    /**
     * Retrieves the current status of the dependency installation process.
     *
     * @return true A ResponseHandler object with the Status of the installation including 'isRunning', optional 'logContent', and 'hasDependencies'.
     */
    public function getDependencyInstallationStatus()
    {
        $flagPath = '/tmp/fm-dependencies.flag';
        $logPath = '/tmp/fm-dependencies.log';
        if (!file_exists($flagPath) && !file_exists($logPath)) {
            return self::setError('No installation process has been initiated.');
        } else if (file_exists($flagPath)) {
            return self::setSuccess(['isRunning' => true]);
        }

        $manifest = $this->getModuleManifest();
        return self::setSuccess([
            'isRunning' => false,
            'logContent' => file_get_contents($logPath),
            'hasDependencies' => self::setupCoreHelper()::checkDependency($manifest['dependencies'])
        ]);
    }

    /**
     * Reads configuration from a specified section or the entire configuration if $section is null.
     *
     * @param string|null $section The section name to read from, or null to read the entire configuration. Defaults to '@settings[0]'
     * @return array The configuration values for a specific section or the entire configuration.
     */
    protected function getConfig($section = '@settings[0]')
    {
        self::setupCoreHelper();
        $configName = "fmod_{$this->moduleName}";
        $config = $this->coreHelper::uciReadConfig($configName);

        // If $section is null, return the entire config.
        if (is_null($section)) {
            return $config;
        }

        return $config[$section] ?? [];
    }

    /**
     * Sets configuration values for a specific section and commits the changes.
     *
     * @param array $values Key-value pairs to be set in the configuration.
     * @param string $section The section name to write to, defaults to '@settings[0]'.
     */
    protected function setConfig($values, $section = '@settings[0]')
    {
        self::setupCoreHelper();

        $configName = "fmod_{$this->moduleName}";
        if (!file_exists("/etc/config/{$configName}")) {
            file_put_contents("/etc/config/{$configName}", '');
            $this->coreHelper::exec("uci add {$configName} settings");
        }

        foreach ($values as $key => $value) {
            $settingString = "{$configName}.{$section}.{$key}";
            $this->coreHelper::uciSet($settingString, $value, false, false);
        }

        $this->coreHelper::uciCommit();
    }

    /**
     * Logs a message to the system's syslog.
     *
     * @param string $message The message to log.
     * @param string $level The severity level of the log ('emerg', 'alert', 'crit', 'err',
     *                       'warning', 'notice', 'info', 'debug'). Default is 'err'.
     */
    protected function logger($message, $level = 'err')
    {
        $status = self::setupCoreHelper()->logger($message, $level);
        if ($status === false) {
            throw new \Exception("Error logging message: {$message}");
        }
    }

    /**
     * Gets the response handler instance.
     *
     * @return ResponseHandler The response handler object.
     */
    public function getResponseHandler()
    {
        return $this->responseHandler;
    }

    /**
     * Sets an error message.
     *
     * @param string $message Error message.
     * @return true
     */
    protected function setError($message = 'The action could not be completed due to an error.')
    {
        $this->responseHandler->setError($message);

        return true;
    }

    /**
     * Sets a success response.
     *
     * @param array $response Success response data.
     * @return true
     */
    protected function setSuccess($response = ['success' => true])
    {
        $this->responseHandler->setData($response);

        return true;
    }
}
