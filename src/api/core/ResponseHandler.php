<?php

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
     * Sets the response data.
     *
     * @param mixed $data Data to be sent in the response.
     */
    public function setData($data)
    {
        $this->data = $data;
    }

    /**
     * Sets an error message.
     *
     * @param string $error Error message.
     */
    public function setError($error)
    {
        $this->error = $error;
    }

    /**
     * Dispatches an error or data response based on the handler's state.
     */
    public function dispatchResponse()
    {
        if ($this->error !== null) {
            $this->sendError($this->error);
        } elseif ($this->data !== null) {
            $this->sendJson($this->data);
        } else {
            $this->sendError('No response generated', 500);
        }
    }

    /**
     * Sends a JSON response.
     *
     * @param mixed $data Data to be encoded in JSON format.
     * @param int $statusCode HTTP status code.
     */
    private function sendJson($data, $statusCode = 200)
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 3600');
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }

    /**
     * Sends an error response.
     *
     * @param string $message Error message.
     * @param int $statusCode HTTP status code for the error.
     */
    private function sendError($message, $statusCode = 400)
    {
        $this->sendJson(['error' => $message], $statusCode);
    }

    /**
     * Streams a file to the client for download.
     *
     * @param string $file The full path to the file to be streamed.
     */
    public function streamFile($file)
    {
        if (!file_exists($file)) {
            exit('Invalid file.');
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
