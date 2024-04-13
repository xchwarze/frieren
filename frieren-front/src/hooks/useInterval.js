import { useState, useEffect, useRef } from 'react';

/**
 * Sets up an interval for executing a callback function.
 *
 * @param {Function} callback - The function to be executed at each interval. It must be async.
 * @param {number|null} delay - The interval duration in milliseconds, or null to stop the interval
 * @return {void}
 */
const useInterval = (callback, delay)  => {
    const savedCallback = useRef();
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        savedCallback.current = async () => {
            if (!isExecuting) {
                setIsExecuting(true);
                await callback();
                setIsExecuting(false);
            }
        };
    }, [callback, isExecuting]);

    useEffect(() => {
        if (delay !== null) {
            let id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export default useInterval;
