/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@common/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@common/services/fetchService.js';
import { DEMO_GET_SYSTEM_STATS } from '@module/feature/helpers/queryKeys.js';

/**
 * Generate a query to fetch system statistics data.
 *
 * @return {Object} The result of the query.
 */
const useSystemStats = () => (
    useAuthenticatedQuery({
        queryKey: [DEMO_GET_SYSTEM_STATS],
        queryFn: () => fetchPost({
            module: 'demo',
            action: 'getSystemStats',
        }),
    })
);

export default useSystemStats;
