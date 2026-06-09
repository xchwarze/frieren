<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\core;

/**
 * Core class of the API framework.
 *
 * This class serves as the central point for handling HTTP requests in the API.
 */
class ApiCore
{
    /**
     * @var array The request data.
     */
    private $request;

    /**
     * @var ResponseHandler Handler for building and sending responses.
     */
    private $responseHandler;

    /**
     * @var Router Router for handling routes.
     */
    private $router;

    /**
     * @var bool True when request parsing failed (bad Content-Type or JSON).
     */
    private $initFailed = false;

    /**
     * Constructor for the class.
     *
     * Initializes the request, sets a CSRF token for security, and sets up
     * the response handler and router. It prepares the class for handling
     * HTTP requests and routing them to the appropriate modules or functions.
     */
    public function __construct()
    {
        $this->responseHandler = new ResponseHandler();

        // Skip session/JSON parsing for CORS preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            return;
        }

        $this->initRequest();
        $this->setCSRFToken();
        $this->router = new Router($this->request);
    }

    /**
     * Initializes the request by decoding JSON input.
     */
    private function initRequest()
    {
        // Require application/json. A cross-site form/simple-request can only send
        // text/plain or form encodings, so this forces any cross-origin caller into
        // a CORS preflight (which same-origin policy blocks) — defense in depth
        // beneath the X-XSRF-TOKEN header check.
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($contentType, 'application/json') !== 0) {
            $this->responseHandler->setError('Unsupported Media Type', 415);
            $this->initFailed = true;
            return;
        }

        $this->request = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->responseHandler->setError('Invalid JSON input');
            $this->initFailed = true;
        }
    }

    /**
     * Sets CSRF token for security.
     */
    public function setCSRFToken()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['XSRF-TOKEN'])) {
            $_SESSION['XSRF-TOKEN'] = bin2hex(random_bytes(32));
            //session_write_close();
        }

        if (!isset($_COOKIE['XSRF-TOKEN']) || $_COOKIE['XSRF-TOKEN'] !== $_SESSION['XSRF-TOKEN']) {
            $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
            setcookie('XSRF-TOKEN', $_SESSION['XSRF-TOKEN'], 0, '/', '', $secure, false);
        }
    }

    /**
     * Handles the incoming request.
     */
    public function handleRequest()
    {
        // Request parsing already failed (bad Content-Type / JSON) — surface that
        // error directly instead of routing a null request through auth.
        if ($this->initFailed) {
            $this->responseHandler->dispatchResponse();
            return;
        }

        try {
            if ($this->authenticated()) {
                $this->responseHandler = $this->router->routeModule();
            }
        } catch (\Exception $error) {
            $this->responseHandler->setError($error->getMessage());
        }

        $this->responseHandler->dispatchResponse();
    }

    /**
     * Authenticates the request.
     *
     * @return bool True if authenticated, false otherwise.
     */
    private function authenticated()
    {
        // TODO: if i want to add api tokens this would be the place to do it

        if (isset($this->request['module']) && $this->request['module'] === 'login') {
            return true;
        }

        if (!isset($_SESSION['user_logged']) || $_SESSION['user_logged'] !== true) {
            $this->responseHandler->setError('Not Authenticated');
            return false;
        }

        //if (!isset($_SERVER['HTTP_X_XSRF_TOKEN']) || $_SERVER['HTTP_X_XSRF_TOKEN'] !== $_SESSION['XSRF-TOKEN']) {
        if (!isset($_COOKIE['XSRF-TOKEN']) || $_COOKIE['XSRF-TOKEN'] !== $_SESSION['XSRF-TOKEN']) {
            $this->responseHandler->setError('Invalid CSRF token');
            return false;
        }

        return true;
    }
}
