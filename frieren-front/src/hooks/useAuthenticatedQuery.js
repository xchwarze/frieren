/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useQuery } from '@tanstack/react-query';

import useHandleError from '@src/hooks/useHandleError.js';

/**
 * Returns a query hook that automatically handles authentication errors and configures query behavior.
 * Utilizes React Query's useQuery for state management and fetching logic.
 *
 * @param {Function} queryFn - The query function to be executed, expected to return a promise.
 * @param {{
 *   queryKey?: unknown[],
 *   enabled?: boolean,
 *   networkMode?: 'online' | 'always' | 'offlineFirst',
 *   initialData?: any,
 *   initialDataUpdatedAt?: number,
 *   meta?: Record<string, unknown>,
 *   notifyOnChangeProps?: string[] | 'all',
 *   placeholderData?: any,
 *   queryKeyHashFn?: (queryKey: unknown[]) => string,
 *   refetchInterval?: number | false,
 *   refetchIntervalInBackground?: boolean,
 *   refetchOnMount?: boolean | 'always',
 *   refetchOnReconnect?: boolean | 'always',
 *   refetchOnWindowFocus?: boolean | 'always',
 *   retry?: boolean | number | ((failureCount: number, error: any) => boolean),
 *   retryDelay?: number | ((retryAttempt: number, error: any) => number),
 *   select?: (data: any) => unknown,
 *   staleTime?: number | Infinity,
 *   structuralSharing?: boolean,
 *   throwOnError?: boolean,
 *   gcTime?: number | Infinity,
 * }} rest - Additional options for the useQuery hook, supporting React Query's configuration options.
 * @return {{
 *   data: any,
 *   dataUpdatedAt: number,
 *   error: any,
 *   errorUpdatedAt: number,
 *   failureCount: number,
 *   failureReason: any | null,
 *   fetchStatus: 'fetching' | 'paused' | 'idle',
 *   isError: boolean,
 *   isFetched: boolean,
 *   isFetchedAfterMount: boolean,
 *   isFetching: boolean,
 *   isInitialLoading: boolean,
 *   isLoading: boolean,
 *   isLoadingError: boolean,
 *   isPaused: boolean,
 *   isPending: boolean,
 *   isPlaceholderData: boolean,
 *   isRefetchError: boolean,
 *   isRefetching: boolean,
 *   isStale: boolean,
 *   isSuccess: boolean,
 *   refetch: (options?: { throwOnError?: boolean, cancelRefetch?: boolean }) => Promise<unknown>,
 *   status: 'pending' | 'error' | 'success',
 * }} The result object from the useQuery hook, containing state and control properties.
 */
const useAuthenticatedQuery = ({ queryFn, ...rest }) => {
    const handleError = useHandleError();

    return useQuery({
        queryFn: async () => {
            try {
                return await queryFn();
            } catch (error) {
                handleError(error);

                throw error;
            }
        },
        ...rest,
    });
};

export default useAuthenticatedQuery;
