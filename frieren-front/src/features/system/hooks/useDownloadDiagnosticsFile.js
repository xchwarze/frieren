/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPostDownload } from '@src/services/fetchService.js';

/**
 * Generates a function that initiates a POST request to download a diagnostics file.
 *
 * @return {Function} A function that when called, sends a POST request to download the diagnostics file.
 */
const useDownloadDiagnosticsFile = () => (
    useAuthenticatedMutation({
        mutationFn: () => fetchPostDownload({
            module: 'system',
            action: 'downloadDiagnosticsFile',
        })
    })
);

export default useDownloadDiagnosticsFile;
