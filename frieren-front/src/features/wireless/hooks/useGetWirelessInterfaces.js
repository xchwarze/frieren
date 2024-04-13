/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_WIRELESS_INTERFACES } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Retrieves the wireless interfaces.
 *
 * @return {Object} The result of the query.
 */
const useGetWirelessInterfaces = () => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_WIRELESS_INTERFACES],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getWirelessInterfaces',
        }),
    })
);

export default useGetWirelessInterfaces;
