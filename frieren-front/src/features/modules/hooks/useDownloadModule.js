/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtomValue } from 'jotai';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { installModuleAtom } from '@src/features/modules/atoms/installModuleAtom.js';
import useDownloadStatus from '@src/features/modules/hooks/useDownloadStatus.js';

/**
 * Returns a mutation hook for downloading a module.
 *
 * @return {Function} The mutation hook.
 */
const useDownloadModule = () => {
    const { name: moduleName, version } = useAtomValue(installModuleAtom);
    const downloadStatus = useDownloadStatus();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'modules',
            action: 'downloadModule',
            moduleName,
            version,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                downloadStatus.start();
            }
        },
    });
};

export default useDownloadModule;
