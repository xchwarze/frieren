/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtomValue } from 'jotai';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { installModuleAtom } from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';
import useInstallationStatus from '@src/features/modules/hooks/useInstallationStatus.js';

/**
 * A custom React hook that handles the installation of a module.
 *
 * @return {Object} The mutation object for installing a module.
 */
const useInstallModule = () => {
    const { name: moduleName, destination, checksum } = useAtomValue(installModuleAtom);
    const installationStatusQuery = useInstallationStatus();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'modules',
            action: 'installModule',
            moduleName,
            destination,
            checksum,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                installationStatusQuery.refetch();
            }
        },
    });
};

export default useInstallModule;
