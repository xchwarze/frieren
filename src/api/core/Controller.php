<?php

namespace frieren\core;

/**
 * Abstract base class for module controllers.
 */
abstract class Controller
{
    /**
     * @var array The request data.
     */
    protected $request;

    /**
     * @var ResponseHandler Handler for building and sending responses.
     */
    protected $responseHandler;

    /**
     * @var Helper for system-specific utilities in host environment.
     */
    protected $systemHelper;

    /**
     * @var array List of valid endpoint route actions.
     */
    protected $endpointRoutes = [];

    /**
     * Constructor for Controller.
     *
     * @param array $request Data of the incoming request.
     */
    public function __construct($request)
    {
        $this->request = $request;
        $this->responseHandler = new ResponseHandler();
        $this->systemHelper = new \frieren\helper\OpenWrtHelper();
        $this->handleActions();
    }

    /**
     * Routes request to a method based on 'action'. Sets error for missing or unknown actions.
     *
     * @return mixed Result of the action method or error response.
     */
    protected function handleActions()
    {
        if (!isset(($this->request['action']))) {
            return $this->responseHandler->setError('No action was specified');
        }

        if (in_array($this->request['action'], $this->endpointRoutes)) {
            return $this->{$this->request['action']}();
        }

        $this->responseHandler->setError('Unknown action');
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
}
