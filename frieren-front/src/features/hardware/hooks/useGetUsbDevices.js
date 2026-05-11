/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { HARDWARE_GET_USB_DEVICES } from '@src/features/hardware/helpers/queryKeys.js';

/**
 * Returns a hook that fetches USB devices using an authenticated query.
 *
 * @return {Object} The result of the query.
 */
const useGetUsbDevices = () => (
    useAuthenticatedQuery({
        queryKey: [HARDWARE_GET_USB_DEVICES],
        queryFn: () => fetchPost({
            module: 'hardware',
            action: 'getUsbDevices',
        })
    })
);

export default useGetUsbDevices;
