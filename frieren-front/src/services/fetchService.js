/**
 * Generates and returns the URL details based on the current window location.
 *
 * @return {string} The complete URL details including protocol, domain, and port if available.
 */
const getUrlDetails = () => {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    let urlDetails = `${protocol}//${domain}`;
    if (port) {
        urlDetails += `:${port}`;
    }

    return urlDetails;
};

/**
 * Fetches data from a specified URL with a timeout.
 *
 * @param {String} url - The URL to fetch data from.
 * @param {Object} options - The options to pass to the fetch function.
 * @param {number} timeout - The timeout in milliseconds.
 * @return {Promise} A promise that resolves to the fetched data or rejects with an error.
 */
const fetchWithTimeout = async (url, options, timeout) => {
    // this way of implementing the timeout is the most minimalist and cleanest I could think of
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(id);
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Server error');
            }

            return data;
        }

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }

        throw error;
    }
};

/**
 * Sends a fetch request to the specified URL with the given method and optional data.
 *
 * @param {String} url - The URL to send the fetch request to.
 * @param {String} method - The HTTP method to use for the fetch request.
 * @param {object|null} [data=null] - Optional data to send with the fetch request.
 * @param {number} [timeout=9000] - Optional timeout value in milliseconds.
 * @return {Promise} A promise that resolves to the response of the fetch request.
 */
export const fetchService = async (url, method, data = null, timeout = 9000) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetchWithTimeout(url, options, timeout);
};

/**
 * Fetches a post using the given data.
 *
 * @param {Object} data - the data to be sent in the POST request
 * @return {Promise} the result of the fetch request
 */
export const fetchPost = (data) => {
    const { VITE_FULL_API_ENDPOINT, VITE_RELATIVE_API_PATH } = import.meta.env;
    let apiUrl = getUrlDetails() + '/' + VITE_RELATIVE_API_PATH;
    if (VITE_FULL_API_ENDPOINT) {
        apiUrl = VITE_FULL_API_ENDPOINT;
    }

    return fetchService(apiUrl, 'POST', data)
};

/**
 * Function to perform a GET request using fetchService.
 *
 * @param {String} url - The URL to fetch data from.
 * @return {Promise} A Promise that resolves with the fetched data.
 */
export const fetchGet = (url) => fetchService(url, 'GET');

/**
 * Fetches and downloads a file using POST request.
 *
 * @param {Object} data - the data to be sent in the POST request
 * @return {Promise} A promise that resolves when the file has been successfully fetched and downloaded.
 */
export const fetchPostDownload = async (data) => {
    const response = await fetchPost(data);
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }

    // Extract file name
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition ? contentDisposition.match(/filename="?([^"]+)"?/i)?.[1] : 'download-file';

    // Generate virtual link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    link.click();
};
