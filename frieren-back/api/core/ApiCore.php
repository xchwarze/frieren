<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
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
     * Constructor for the class.
     *
     * Initializes the request, sets a CSRF token for security, and sets up
     * the response handler and router. It prepares the class for handling
     * HTTP requests and routing them to the appropriate modules or functions.
     */
    public function __construct()
    {
        $this->responseHandler = new ResponseHandler();

        $this->initRequest();
        $this->setCSRFToken();
        $this->router = new Router($this->request);
    }

    /**
     * Initializes the request by decoding JSON input.
     */
    private function initRequest()
    {
        $this->request = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->responseHandler->setError('Invalid JSON input');
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
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'OPTIONS' && $this->authenticated()) {
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
