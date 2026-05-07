/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { PACKAGES_GET_REMOVE_STATUS } from '@src/features/packages/helpers/queryKeys.js';

/**
 * A custom hook to poll the package remove status.
 *
 * @param {Object} options - Optional configuration options for the query hook.
 * @return {Object} The result of the query.
 */
const useGetRemoveStatus = (options = {}) => (
    useAuthenticatedQuery({
        queryKey: [PACKAGES_GET_REMOVE_STATUS],
        queryFn: () => fetchPost({
            module: 'packages',
            action: 'getRemoveStatus',
        }),
        staleTime: 0,
        refetchInterval: 2500,
        ...options,
    })
);

export default useGetRemoveStatus;
