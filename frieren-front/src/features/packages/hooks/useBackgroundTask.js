/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useState, useRef, useCallback } from 'react';

import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Tracks a background task status via polling.
 *
 * @param {Object} options
 * @param {string} options.queryKey - React Query cache key for the status query.
 * @param {string} options.action - Backend action name to poll.
 * @param {Function} [options.onCompleted] - Called with response data when task completes.
 * @return {Object} Query object extended with isRunning flag and start function.
 */
const useBackgroundTask = ({ queryKey, action, onCompleted, gcTime }) => {
    const [isRunning, setIsRunning] = useState(false);
    const onCompletedRef = useRef(onCompleted);
    onCompletedRef.current = onCompleted;

    const query = useAuthenticatedQuery({
        queryKey: [queryKey],
        queryFn: () => fetchPost({ module: 'packages', action }),
        enabled: isRunning,
        staleTime: 0,
        refetchInterval: 2500,
        ...(gcTime !== undefined && { gcTime }),
    });

    useEffect(() => {
        if (query.isSuccess && query.isFetching === false) {
            setIsRunning(query.data?.completed === false);

            if (query.data?.completed) {
                onCompletedRef.current?.(query.data);
            }
        }
    }, [query.data, query.isSuccess, query.isFetching]);

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    return { ...query, isRunning, start };
};

export default useBackgroundTask;
