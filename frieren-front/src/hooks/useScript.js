import { useState, useEffect, useCallback } from 'react';

/**
 * Dynamically loads a script and updates status based on its loading state. Provides a retry functionality.
 *
 * @param {String} src - The URL of the script to be loaded.
 * @return {Object} The current status of the script loading process and a retry function.
 */
const useScript = (src) => {
    const getScript = useCallback(
        () => document.querySelector(`script[src="${src}"]`),
        [src]
    );
    const [status, setStatus] = useState(() => {
        const script = getScript();
        return script ? script.getAttribute('data-status') : 'loading';
    });
    const [loadAttempt, setLoadAttempt] = useState(0);

    const retry = useCallback(() => {
        const script = getScript();
        if (script) {
            script.setAttribute('data-status', 'loading');
        }

        setStatus('loading');
        setLoadAttempt((prevAttempt) => prevAttempt + 1);
    }, [getScript]);

    useEffect(() => {
        if (!src) {
            setStatus('idle');
            return;
        }

        let script = getScript();
        if (script && script.getAttribute('data-status') === 'ready') {
            setStatus('ready');
            return;
        }

        if (script) {
            document.body.removeChild(script);
        }

        script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.setAttribute('data-status', 'loading');
        document.body.appendChild(script);

        const setAttributeFromEvent = (event) => {
            const newStatus = event.type === 'load' ? 'ready' : 'error';
            script.setAttribute('data-status', newStatus);
            setStatus(newStatus);
        };

        script.addEventListener('load', setAttributeFromEvent);
        script.addEventListener('error', setAttributeFromEvent);

        return () => {
            script.removeEventListener('load', setAttributeFromEvent);
            script.removeEventListener('error', setAttributeFromEvent);
        };
    }, [src, loadAttempt, getScript]);

    return { status, retry };
};

export default useScript;
