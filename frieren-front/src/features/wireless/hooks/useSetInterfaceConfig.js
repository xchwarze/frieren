/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Returns a mutation hook to update the configuration of an existing wireless interface.
 * Overview refresh is handled by InterfaceStatusNotifier after the interface status is resolved.
 *
 * @return {Object} The mutation object.
 */
const useSetInterfaceConfig = () => {
    return useAuthenticatedMutation({
        mutationFn: ({ section, ssid, encryption, key, mode, network, hidden, disabled, isManagement, isRecon }) => fetchPost({
            module: 'wireless',
            action: 'setInterfaceConfig',
            section,
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

export default useSetInterfaceConfig;
