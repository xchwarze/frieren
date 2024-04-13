/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { HARDWARE_GET_SYSTEM_LOGS } from '@src/features/hardware/helpers/queryKeys.js';

/**
 * Retrieves system logs using an authenticated query.
 *
 * @return {Object} The result of the query.
 */
const useGetSystemLogs = () => (
    useAuthenticatedQuery({
        queryKey: [HARDWARE_GET_SYSTEM_LOGS],
        queryFn: () => fetchPost({
            module: 'hardware',
            action: 'getSystemLogs',
        })
    })
);

export default useGetSystemLogs;
