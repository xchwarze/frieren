<?php

// for local dev
// the idea of this is to run `cd tools && php -S localhost:8000`
// and that api-proxy.php redirects calls to the actual hardware
error_reporting(E_ALL);
ini_set('display_errors', '1');

class RequestForwarder
{
    private $responseHeaders = [];

    /**
     * Forwards the current request to the specified endpoint using cURL.
     *
     * @param string $endpoint The URL of the endpoint to forward the request to.
     * @throws Exception If there is an error executing the cURL request.
     * @return void
     */
    public function forwardRequest($endpoint)
    {
        $ch = curl_init($endpoint);
        $cookieHeader = $this->buildCookieHeader($_COOKIE);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => file_get_contents('php://input'),
            CURLOPT_COOKIE => $cookieHeader,
            CURLOPT_HTTPHEADER => $this->buildForwardedRequestHeaders(),
            CURLOPT_HEADERFUNCTION => [$this, 'captureAndForwardHeaders']
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        http_response_code($httpCode);
        $this->sendResponseHeaders();

        echo $response;
    }

    /**
     * Builds the request headers to forward to the device.
     *
     * The backend requires Content-Type: application/json (its CSRF defense
     * rejects anything else), and echoes the XSRF-TOKEN cookie back via the
     * X-XSRF-TOKEN header (double-submit). Neither survives by default since
     * curl doesn't inherit the incoming request's headers.
     *
     * @return string[] Header lines to pass via CURLOPT_HTTPHEADER.
     */
    private function buildForwardedRequestHeaders()
    {
        $headers = [];

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if ($contentType !== '') {
            $headers[] = "Content-Type: $contentType";
        }

        $xsrfToken = $this->getRequestHeader('X-XSRF-TOKEN');
        if ($xsrfToken !== null) {
            $headers[] = "X-XSRF-TOKEN: $xsrfToken";
        }

        return $headers;
    }

    /**
     * Reads an incoming request header by name (case-insensitive), independent
     * of getallheaders() availability under the PHP built-in server.
     *
     * @param string $name Header name, e.g. "X-XSRF-TOKEN".
     * @return string|null The header value, or null if not present.
     */
    private function getRequestHeader($name)
    {
        $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));

        return $_SERVER[$serverKey] ?? null;
    }

    /**
     * Builds a cookie header from the given cookies array.
     *
     * @param array $cookies The array of cookies to build the header from.
     * @return string The resulting cookie header.
     */
    private function buildCookieHeader($cookies)
    {
        $cookieHeader = [];
        foreach ($cookies as $name => $value) {
            $cookieHeader[] = "$name=$value";
        }

        return implode('; ', $cookieHeader);
    }

    /**
     * Capture and forward headers.
     *
     * @param mixed $curl The cURL resource.
     * @param string $header The header string.
     * @return int The length of the header.
     */
    private function captureAndForwardHeaders($curl, $header)
    {
        if (preg_match('/^Set-Cookie:\s*(PHPSESSID|XSRF-TOKEN)=([^;]+)/i', $header, $matches)) {
            $name = $matches[1];
            $value = $matches[2];
            $httponly = $name == 'PHPSESSID';
            setcookie($name, $value, 0, '/', '', false, $httponly);
        } else {
            $this->responseHeaders[] = $header;
        }

        return strlen($header);
    }

    /**
     * Send the response headers to the client excluding specific headers.
     */
    private function sendResponseHeaders()
    {
        //var_dump($this->responseHeaders); exit();
        foreach ($this->responseHeaders as $header) {
            if (preg_match('/^(HTTP|Transfer-Encoding|Connection):/i', $header)) {
                continue;
            }

            header(trim($header));
        }
    }
}

$forwarder = new RequestForwarder();
$endpoint = 'http://192.168.7.1:5000/api/index.php';
$forwarder->forwardRequest($endpoint);
