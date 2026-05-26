/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { Alert } from 'react-bootstrap';

import Button from '@src/components/Button';
import ConfirmationModal from '@src/components/ConfirmationModal';
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
    const [showConfirm, setShowConfirm] = useState(false);
    const lastVersion = data?.lastVersion;
    const hasUpdate = isSuccess && lastVersion && lastVersion.version !== appVersion;

    if (!hasUpdate) {
        return null;
    }

    const handleConfirm = () => {
        setShowConfirm(false);
        startUpdate({ updateUrl: lastVersion.updateUrl });
    };

    return (
        <>
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
                        onClick={() => setShowConfirm(true)}
                    />
                )}
            </Alert>
            <ConfirmationModal
                show={showConfirm}
                onHide={() => setShowConfirm(false)}
                onConfirm={handleConfirm}
                title={'Confirm System Update'}
                description={`This will download and install version ${lastVersion.version}. The device will reboot after the update completes. Continue?`}
            />
        </>
    );
};

export default UpdateAlert;
