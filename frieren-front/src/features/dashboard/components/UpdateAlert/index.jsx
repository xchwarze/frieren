/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Alert } from 'react-bootstrap';

import Button from '@src/components/Button';
import useNews from '@src/features/dashboard/hooks/useNews.js';
import useSystemUpdate from '@src/features/dashboard/hooks/useSystemUpdate.js';

const appVersion = import.meta.env.VITE_APP_VERSION;

/**
 * Displays an alert when a newer version of Frieren is available.
 * Shows an update button when an updateUrl is provided.
 *
 * @return {ReactElement|null} The update alert or null if up to date.
 */
const UpdateAlert = () => {
    const { data, isSuccess } = useNews();
    const { startUpdate, isUpdating, isPending } = useSystemUpdate();
    const lastVersion = data?.lastVersion;
    const hasUpdate = isSuccess && lastVersion && lastVersion.version !== appVersion;

    if (!hasUpdate) {
        return null;
    }

    return (
        <Alert variant={'info'} className={'mb-0 d-flex align-items-center justify-content-between'}>
            <div>
                <strong>Latest version: {lastVersion.version}</strong>
                {lastVersion.comment && (
                    <span> — {lastVersion.comment}</span>
                )}
            </div>
            {lastVersion.updateUrl && (
                <Button
                    variant={'primary'}
                    size={'sm'}
                    icon={'download'}
                    label={isUpdating ? 'Updating...' : 'Update'}
                    loading={isUpdating || isPending}
                    disabled={isUpdating || isPending}
                    onClick={() => startUpdate({ updateUrl: lastVersion.updateUrl })}
                />
            )}
        </Alert>
    );
};

export default UpdateAlert;
