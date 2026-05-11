/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_ASSOCIATION_LIST } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a hook to get the list of stations associated with a given interface.
 *
 * @param {String} iface - The interface name (e.g. 'wlan0').
 * @return {Object} The result of the query.
 */
const useGetAssociationList = (iface) => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_ASSOCIATION_LIST, iface],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getAssociationList',
            interface: iface,
        }),
        enabled: !!iface,
    })
);

export default useGetAssociationList;
