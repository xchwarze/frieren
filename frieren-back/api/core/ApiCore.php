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
     * Name of the double-submit CSRF token: the session key and the cookie name
     * (the SPA echoes its value back in the X-XSRF-TOKEN request header).
     */
    const CSRF_TOKEN_KEY = 'XSRF-TOKEN';

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

        // A bodiless OPTIONS request carries no JSON to parse; skip request/session
        // setup and let handleRequest() reject it via the normal auth path.
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
        $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

        if (session_status() == PHP_SESSION_NONE) {
            // SameSite=Lax keeps the session cookie off cross-site POSTs — defense
            // in depth beneath the header token check in authenticated().
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $secure,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_start();
        }

        if (!isset($_SESSION[self::CSRF_TOKEN_KEY])) {
            $_SESSION[self::CSRF_TOKEN_KEY] = bin2hex(random_bytes(32));
        }

        if (!isset($_COOKIE[self::CSRF_TOKEN_KEY]) || $_COOKIE[self::CSRF_TOKEN_KEY] !== $_SESSION[self::CSRF_TOKEN_KEY]) {
            self::sendCsrfCookie($_SESSION[self::CSRF_TOKEN_KEY]);
        }
    }

    /**
     * Writes the JS-readable double-submit CSRF cookie. Setting and clearing it must
     * share identical attributes, so both setCSRFToken() and logout() funnel through
     * here. httponly is intentionally false: the SPA reads this cookie to echo it back
     * in the X-XSRF-TOKEN header, which a cross-site page cannot do.
     *
     * @param string $value Token value ('' to clear the cookie).
     * @param int $expires Expiry timestamp (0 = session cookie).
     */
    public static function sendCsrfCookie($value, $expires = 0)
    {
        $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        setcookie(self::CSRF_TOKEN_KEY, $value, [
            'expires' => $expires,
            'path' => '/',
            'domain' => '',
            'secure' => $secure,
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
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
                // Release the session lock before dispatching. PHP's file session
                // handler holds an exclusive lock from session_start() until close,
                // so leaving it open serializes every concurrent request from the
                // same session behind a slow action (ping, terminal start, opkg).
                // The login module manages its own session writes, so skip it there.
                if (($this->request['module'] ?? '') !== 'login') {
                    session_write_close();
                }

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

        // Header-based double-submit: compare the X-XSRF-TOKEN header (timing-safe)
        // against the session token. A cross-site attacker cannot read the JS-readable
        // XSRF-TOKEN cookie to echo it here, so a forged request carries no valid token.
        if (!isset($_SERVER['HTTP_X_XSRF_TOKEN']) || !hash_equals($_SESSION[self::CSRF_TOKEN_KEY], $_SERVER['HTTP_X_XSRF_TOKEN'])) {
            $this->responseHandler->setError('Invalid CSRF token');
            return false;
        }

        return true;
    }
}
