/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * Configures the query client with default options including garbage collection time, stale time, retry logic, and retry delay.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // milliseconds * seconds * minutes
            gcTime: 1000 * 60 * 15,
            staleTime: 1000 * 60 * 10,

            //refetchOnReconnect: true,
            retry: (failureCount, error) => {
                return failureCount < 3 && error.response?.status >= 500;
            },
            retryDelay: (attemptIndex) => {
                // 200ms, 400ms, 800ms...
                return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
        },
    },
});
