/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_RADIO_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns a hook to get the configuration for a specific radio device.
 *
 * @param {String} radio - The radio identifier (e.g. 'radio0').
 * @return {Object} The result of the query.
 */
const useGetRadioConfig = (radio) => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_RADIO_CONFIG, radio],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getRadioConfig',
            radio,
        }),
        enabled: !!radio,
    })
);

export default useGetRadioConfig;
