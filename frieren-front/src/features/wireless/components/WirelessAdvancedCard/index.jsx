/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import PanelCard from '@src/components/PanelCard';
import Button from '@src/components/Button';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useGetRawWirelessConfig from '@src/features/wireless/hooks/useGetRawWirelessConfig.js';
import useSetRawWirelessConfig from '@src/features/wireless/hooks/useSetRawWirelessConfig.js';
import useResetWirelessConfig from '@src/features/wireless/hooks/useResetWirelessConfig.js';

/**
 * Card for editing the raw /etc/config/wireless UCI file directly.
 * Provides save, reload, and reset-to-defaults actions.
 *
 * @return {ReactElement} The WirelessAdvancedCard component.
 */
const WirelessAdvancedCard = () => {
    const { data, isFetching, refetch } = useGetRawWirelessConfig();
    const { mutate: saveConfig, isPending: isSaving } = useSetRawWirelessConfig();
    const { mutate: resetConfig, isPending: isResetting } = useResetWirelessConfig();

    const [content, setContent] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);

    const isBusy = isSaving || isResetting || isFetching;

    useEffect(() => {
        if (data?.content !== undefined) {
            setContent(data.content);
        }
    }, [data?.content]);

    const handleSave = () => {
        saveConfig({ content }, {
            onSuccess: () => toast.success('Wireless config saved and reloaded'),
        });
    };

    const handleReset = () => {
        resetConfig(undefined, {
            onSuccess: () => {
                toast.success('Wireless config reset to defaults');
                setShowResetModal(false);
            },
        });
    };

    return (
        <PanelCard
            title={'Raw Wireless Config'}
            subtitle={'Edit /etc/config/wireless directly. Changes are applied immediately via wifi reload.'}
            showRefresh={true}
            refetch={refetch}
            isFetching={isBusy}
        >
            <Form.Control
                as={'textarea'}
                rows={20}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isBusy}
                className={'font-monospace'}
                spellCheck={false}
            />
            <div className={'d-flex justify-content-end gap-2 mt-3'}>
                <Button
                    icon={'save'}
                    label={'Save & Reload'}
                    loading={isSaving}
                    disabled={isBusy}
                    onClick={handleSave}
                />
                <Button
                    icon={'rotate-ccw'}
                    label={'Reset to Defaults'}
                    variant={'outline-danger'}
                    loading={isResetting}
                    disabled={isBusy}
                    onClick={() => setShowResetModal(true)}
                />
            </div>
            <ConfirmationModal
                show={showResetModal}
                onHide={() => setShowResetModal(false)}
                onConfirm={handleReset}
                title={'Reset Wireless Config'}
                description={'This will regenerate /etc/config/wireless from hardware defaults using "wifi config". All custom configuration will be lost. Are you sure?'}
                isConfirmLoading={isResetting}
            />
        </PanelCard>
    );
};

export default WirelessAdvancedCard;
