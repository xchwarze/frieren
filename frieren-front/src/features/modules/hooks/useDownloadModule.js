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
import useDownloadStatus from '@src/features/modules/hooks/useDownloadStatus.js';

/**
 * Returns a mutation hook for downloading a module.
 *
 * @return {Function} The mutation hook.
 */
const useDownloadModule = () => {
    const { name: moduleName, version } = useAtomValue(installModuleAtom);
    const downloadStatusQuery = useDownloadStatus();

    return useAuthenticatedMutation({
        mutationFn: () => fetchPost({
            module: 'modules',
            action: 'downloadModule',
            moduleName,
            version,
        }),
        onSuccess: ({ success }) => {
            if (success) {
                downloadStatusQuery.refetch();
            }
        },
    });
};

export default useDownloadModule;
