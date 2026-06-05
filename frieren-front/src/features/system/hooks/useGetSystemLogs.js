/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_SYSTEM_LOGS } from '@src/features/system/helpers/queryKeys.js';

/**
 * Retrieves system logs using an authenticated query.
 *
 * @return {Object} The result of the query.
 */
const useGetSystemLogs = () => (
    useAuthenticatedQuery({
        queryKey: [SYSTEM_GET_SYSTEM_LOGS],
        queryFn: () => fetchPost({
            module: 'system',
            action: 'getSystemLogs',
        })
    })
);

export default useGetSystemLogs;
