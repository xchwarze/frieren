/**
 * Opens a new tab with the specified URL.
 *
 * @param {String} url - The URL to open in a new tab
 * @return {void}
 */
export const openLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Creates a promise that resolves after the specified delay.
 *
 * @param {number} delay - The delay in milliseconds
 * @return {Promise} A dummy promise that resolves after the specified delay
 */
export const sleep = (delay) => {
    return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} string - The input string to capitalize.
 * @return {string} The input string with the first letter capitalized.
 */
export const ucfirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
