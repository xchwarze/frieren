/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_SERVICES } from '@src/features/system/helpers/queryKeys.js';

/**
 * Returns a query hook with the list of init.d services and their state.
 *
 * @return {Object} The query object.
 */
const useGetServices = () => useAuthenticatedQuery({
    queryKey: [SYSTEM_GET_SERVICES],
    queryFn: () => fetchPost({
        module: 'system',
        action: 'getServices',
    }),
});

export default useGetServices;
