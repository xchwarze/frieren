<?php
/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */

namespace frieren\core;

/**
 * Handles HTTP responses for the application.
 */
class ResponseHandler
{
    /**
     * @var mixed Stores the data to be sent in the response.
     */
    private $data = null;

    /**
     * @var string|null Stores an error message if one occurs during processing.
     */
    private $error = null;

    /**
     * @var int Stores the HTTP status code for the response.
     */
    private $statusCode = null;

    /**
     * Sets the response data.
     *
     * @param mixed $data Data to be sent in the response.
     * @param int $statusCode The HTTP status code to set.
     */
    public function setData($data, $statusCode = 200)
    {
        $this->data = $data;
        $this->statusCode = $statusCode;
    }

    /**
     * Sets an error message.
     *
     * @param string $error Error message.
     * @param int $statusCode The HTTP status code to set.
     */
    public function setError($error, $statusCode = 400)
    {
        $this->error = $error;
        $this->statusCode = $statusCode;
    }

    /**
     * Dispatches an error or data response based on the handler's state.
     */
    public function dispatchResponse()
    {
        if ($this->error !== null) {
            $this->sendJson(['error' => $this->error]);
        } else {
            $this->sendJson($this->data);
        }
    }

    /**
     * Sends a JSON response.
     *
     * @param mixed $data Data to be encoded in JSON format.
     */
    private function sendJson($data)
    {
        // Same-origin only: the panel and API are served from the same origin in
        // production, and the dev server proxies /api server-side, so the browser
        // never makes a cross-origin call. Emitting no CORS headers blocks any
        // cross-origin site from reading responses — the prior `*` + credentials
        // combo was spec-invalid anyway.
        header('Content-Type: application/json');
        http_response_code($this->statusCode);
        echo json_encode($data);
        exit;
    }

    /**
     * Streams a file to the client for download.
     *
     * @param string $file The full path to the file to be streamed.
     */
    public function streamFile($file)
    {
        if (!file_exists($file)) {
            exit('File not found.');
        }

        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
        header('Content-Length: ' . filesize($file));
        header('Expires: 0');
        readfile($file);
        exit;
    }
}
