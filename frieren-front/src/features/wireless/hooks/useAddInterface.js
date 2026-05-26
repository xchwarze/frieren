/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Returns a mutation hook to add a new wireless interface to a radio.
 * Overview refresh is handled by InterfaceStatusNotifier after the interface status is resolved.
 *
 * @return {Object} The mutation object.
 */
const useAddInterface = () => {
    return useAuthenticatedMutation({
        mutationFn: ({ radio, ssid, encryption, key, mode, network, hidden, disabled, isManagement, isRecon }) => fetchPost({
            module: 'wireless',
            action: 'addInterface',
            radio,
            ssid,
            encryption,
            key,
            mode,
            network,
            hidden,
            disabled,
            isManagement,
            isRecon,
        }),
    });
};

export default useAddInterface;
