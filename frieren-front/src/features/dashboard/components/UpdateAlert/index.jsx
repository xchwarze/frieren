/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Alert } from 'react-bootstrap';

import useNews from '@src/features/dashboard/hooks/useNews.js';

const appVersion = import.meta.env.VITE_APP_VERSION;

/**
 * Displays an alert when a newer version of Frieren is available.
 *
 * @return {ReactElement|null} The update alert or null if up to date.
 */
const UpdateAlert = () => {
    const { data, isSuccess } = useNews();
    const lastVersion = data?.lastVersion;
    const hasUpdate = isSuccess && lastVersion && lastVersion.version !== appVersion;

    if (!hasUpdate) {
        return null;
    }

    return (
        <Alert variant={'info'} className={'mb-0'}>
            <strong>Latest version: {lastVersion.version}</strong>
            {lastVersion.comment && (
                <span> — {lastVersion.comment}</span>
            )}
        </Alert>
    );
};

export default UpdateAlert;
