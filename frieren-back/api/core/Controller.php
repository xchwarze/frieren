<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
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
    const TASK_DEPENDENCIES = 'fm-dependencies';

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

        if (!isset($this->endpointRoutes[$this->request['action']])) {
            return self::setError('Unknown action');
        }

        $content = $this->{$this->request['action']}();
        session_write_close();

        return $content;
    }

    /**
     * Sets up the core helper based on the operating system family.
     *
     * @return object The instance of the core-specific helper.
     * @throws \Exception If the core helper cannot be created.
     */
    protected function setupCoreHelper() {
        if ($this->coreHelper === null) {
            $this->coreHelper = \frieren\helper\HelperFactory::create(\DeviceConfig::GUESS_TYPE);
        }

        return $this->coreHelper;
    }

    /**
     * Sets up the module helper based on the operating system family and module name.
     *
     * @return object The instance of the module-specific helper.
     * @throws \Exception If the module helper cannot be created.
     */
    protected function setupModuleHelper() {
        if ($this->moduleHelper === null) {
            $this->moduleHelper = \frieren\helper\HelperFactory::createModuleHelper($this->moduleName, \DeviceConfig::GUESS_TYPE);
        }

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
     * Install module dependencies using the packages package-manager-call.sh script.
     *
     * @return true A ResponseHandler object with the standard response.
     */
    public function installModuleDependencies() {
        $manifest = $this->getModuleManifest();
        $dependencies = implode(' ', $manifest['dependencies'] ?? []);
        if (empty($dependencies)) {
            return self::setError();
        }

        if (\frieren\helper\BackgroundTaskHelper::isRunning(self::TASK_DEPENDENCIES)) {
            return self::setError('Installation in progress. Please wait until the current installation is finished.');
        }

        $installToSD = ($this->request['destination'] ?? null) === 'sd';
        self::setupCoreHelper()::installDependency($dependencies, $installToSD, self::TASK_DEPENDENCIES);

        return self::setSuccess();
    }

    /**
     * Retrieves the current status of the dependency installation process.
     *
     * @return true A ResponseHandler object with the status of the installation.
     */
    public function getDependencyInstallationStatus()
    {
        $status = \frieren\helper\BackgroundTaskHelper::getStatus(self::TASK_DEPENDENCIES);
        $status['output'] = $this->formatDependencyLog($status['output']);

        if ($status['completed']) {
            $manifest = $this->getModuleManifest();
            $status['hasDependencies'] = self::setupCoreHelper()::checkDependency($manifest['dependencies'] ?? []);
        }

        return self::setSuccess($status);
    }

    /**
     * Turns the package-manager-call.sh JSON output into a readable installation log.
     * Falls back to the raw output when it is not valid JSON (e.g. still empty while running).
     *
     * @param string $output Raw captured task output.
     * @return string Human readable log content.
     */
    private function formatDependencyLog($output)
    {
        $decoded = json_decode($output, true);
        if (!is_array($decoded)) {
            return $output;
        }

        $log = trim(($decoded['stdout'] ?? '') . "\n" . ($decoded['stderr'] ?? ''));

        return $log === '' ? $output : $log;
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

        // Module config file is created lazily on first setConfig(); until then there is
        // nothing to read, so return empty instead of letting uciReadConfig() throw.
        if (!file_exists("/etc/config/{$configName}")) {
            return [];
        }

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
     * @return ResponseHandler The response handler object.
     */
    protected function setError($message = 'The action could not be completed due to an error.')
    {
        $this->responseHandler->setError($message);

        return $this->responseHandler;
    }

    /**
     * Sets a success response.
     *
     * @param array $response Success response data.
     * @return ResponseHandler The response handler object.
     */
    protected function setSuccess($response = ['success' => true])
    {
        $this->responseHandler->setData($response);

        return $this->responseHandler;
    }
}
