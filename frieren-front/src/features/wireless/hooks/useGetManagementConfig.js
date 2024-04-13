/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_MANAGEMENT_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a hook to get the wireless configuration for the Management network.
 *
 * @return {Object} The result of the query.
 */
const useGetManagementConfig = () => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_MANAGEMENT_CONFIG],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getManagementConfig',
        }),
    })
);

export default useGetManagementConfig;
