/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_RAW_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns the raw content of /etc/config/wireless.
 *
 * @return {Object} The query result with data.content.
 */
const useGetRawWirelessConfig = () => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_RAW_CONFIG],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getRawWirelessConfig',
        }),
    })
);

export default useGetRawWirelessConfig;
