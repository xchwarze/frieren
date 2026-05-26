/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';

import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';

const DEFAULT_TIMEOUT = 3600000;

/**
 * Tracks a background task status via polling.
 *
 * @param {Object} options
 * @param {string} options.queryKey - React Query cache key for the status query.
 * @param {string} options.module - Backend module name.
 * @param {string} options.action - Backend action name to poll.
 * @param {Function} [options.onCompleted] - Called with response data when task completes.
 * @param {number} [options.refetchInterval=2000] - Polling interval in milliseconds.
 * @param {number} [options.timeout=3600000] - Maximum time in ms before the task is considered timed out.
 * @param {number} [options.gcTime] - React Query garbage collection time.
 * @return {Object} Query object extended with isRunning flag and start function.
 */
const useBackgroundTask = ({ queryKey, module, action, onCompleted, refetchInterval = 2000, timeout = DEFAULT_TIMEOUT, gcTime }) => {
    const [isRunning, setIsRunning] = useState(false);
    const onCompletedRef = useRef(onCompleted);
    const timeoutRef = useRef(null);
    onCompletedRef.current = onCompleted;

    const query = useAuthenticatedQuery({
        queryKey: [queryKey],
        queryFn: () => fetchPost({ module, action }),
        enabled: isRunning,
        staleTime: 0,
        refetchInterval,
        ...(gcTime !== undefined && { gcTime }),
    });

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            setIsRunning(false);
            toast.error('Task timed out');
        }, timeout);

        return () => clearTimeout(timeoutRef.current);
    }, [isRunning, timeout]);

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        if (query.isSuccess && query.isFetching === false) {
            setIsRunning(query.data?.completed === false);

            if (query.data?.completed) {
                clearTimeout(timeoutRef.current);
                onCompletedRef.current?.(query.data);
            }
        }
    }, [isRunning, query.data, query.isSuccess, query.isFetching]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    return { ...query, isRunning, start };
};

export default useBackgroundTask;
