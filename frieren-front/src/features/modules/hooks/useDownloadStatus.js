/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useBackgroundTask from '@src/hooks/useBackgroundTask.js';
import { MODULES_DOWNLOAD_STATUS } from '@src/features/modules/helpers/queryKeys.js';
import useInstallModule from '@src/features/modules/hooks/useInstallModule.js';

/**
 * Tracks module download status via polling. Triggers install on completion.
 *
 * @return {Object} Query object with isRunning flag and start function.
 */
const useDownloadStatus = () => {
    const { mutate: installModule } = useInstallModule();

    return useBackgroundTask({
        queryKey: MODULES_DOWNLOAD_STATUS,
        module: 'modules',
        action: 'downloadStatus',
        onCompleted: () => installModule(),
    });
};

export default useDownloadStatus;
