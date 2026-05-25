/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useSetAtom } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';

import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_INSTALLATION_STATUS, MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';
import { installModuleAtom } from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';

/**
 * Tracks module installation status via polling. Invalidates queries on completion.
 *
 * @return {Object} Query object with isRunning flag and start function.
 */
const useInstallationStatus = () => {
    const setInstallModule = useSetAtom(installModuleAtom);
    const queryClient = useQueryClient();

    return useBackgroundTask({
        queryKey: MODULES_INSTALLATION_STATUS,
        module: 'modules',
        action: 'installStatus',
        onCompleted: () => {
            queryClient.invalidateQueries({ queryKey: [MODULES_GET_MODULE_LIST] });
            queryClient.invalidateQueries({ queryKey: [MODULES_GET_INSTALLED_MODULES] });
            setInstallModule(false);
        },
    });
};

export default useInstallationStatus;
