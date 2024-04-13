/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Set the wireless configuration for the Management network.
 *
 * @return {Function} The mutation hook.
 */
const useSetManagementConfig = () => (
    useAuthenticatedMutation({
        mutationFn: ({ interface: wlanInterface, ssid, psk, hidden, disabled }) => fetchPost({
            module: 'wireless',
            action: 'setManagementConfig',
            interface: wlanInterface,
            ssid,
            psk,
            hidden,
            disabled,
        }),
    })
);

export default useSetManagementConfig;
