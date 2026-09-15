/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { WIRELESS_GET_ENCRYPTION_OPTIONS } from '@src/features/wireless/helpers/queryKeys.js';

/**
 * Returns encryption options supported by the selected radio and wireless mode.
 *
 * @param {String} radio - The radio identifier.
 * @param {String} mode - The wireless mode.
 * @return {Object} The result of the query.
 */
const useGetEncryptionOptions = (radio, mode) => (
    useAuthenticatedQuery({
        queryKey: [WIRELESS_GET_ENCRYPTION_OPTIONS, radio, mode],
        queryFn: () => fetchPost({
            module: 'wireless',
            action: 'getEncryptionOptions',
            radio,
            mode,
        }),
        enabled: !!radio && (mode === 'ap' || mode === 'sta'),
    })
);

export default useGetEncryptionOptions;
