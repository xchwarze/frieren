/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_CLIENT_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Get client configuration data.
 *
 * @return {Object} The result of the query.
 */
const useGetClientConfig = () => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_CLIENT_CONFIG],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getClientConfig',
        }),
    })
);

export default useGetClientConfig;
