/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_INTERFACE_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

const useGetInterfaceConfig = (section) => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_INTERFACE_CONFIG, section],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getInterfaceConfig',
            section,
        }),
        enabled: !!section,
    })
);

export default useGetInterfaceConfig;
