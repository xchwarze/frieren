/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useCallback } from 'react';

import PanelCard from '@src/components/PanelCard';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import ScanModal from '@src/features/wireless/components/ScanModal';
import InterfaceFormModal from '@src/features/wireless/components/InterfaceFormModal';
import RadioConfigModal from '@src/features/wireless/components/RadioConfigModal';
import RadioSection from './RadioSection';

const mapScanSecurityToEncryption = (security) => {
    if (!security || security === 'Open') return 'none';
    if (security.includes('WPA3-SAE')) return 'sae';
    if (security.includes('WPA2-PSK')) return 'psk2+ccmp';
    if (security.includes('WPA-PSK')) return 'psk-mixed+ccmp';
    return 'psk2+ccmp';
};

const WirelessOverviewCard = () => {
    const { data: overview, refetch, isFetching } = useGetWirelessOverview();
    const radios = overview ?? {};

    const [scanModal, setScanModal] = useState({ show: false, radioName: '' });
    const [formModal, setFormModal] = useState({ show: false, radio: null, section: null, initialValues: null });
    const [radioConfigModal, setRadioConfigModal] = useState({ show: false, radioName: '', band: '' });

    const handleScan = useCallback((radioName) => {
        setScanModal({ show: true, radioName });
    }, []);

    const handleEdit = useCallback((section) => {
        setFormModal({ show: true, radio: null, section, initialValues: null });
    }, []);

    const handleAdd = useCallback((radio) => {
        setFormModal({ show: true, radio, section: null, initialValues: null });
    }, []);

    const handleConnectFromScan = useCallback((network) => {
        const targetRadio = scanModal.radioName;
        setScanModal({ show: false, radioName: '' });
        setFormModal({
            show: true,
            radio: targetRadio,
            section: null,
            initialValues: {
                ssid: network.ssid || '',
                mode: 'sta',
                network: 'wwan',
                encryption: mapScanSecurityToEncryption(network.security),
                key: '',
                hidden: false,
                disabled: false,
            },
        });
    }, [scanModal.radioName]);

    const handleConfigure = useCallback((radioName, band) => {
        setRadioConfigModal({ show: true, radioName, band });
    }, []);

    return (
        <PanelCard title={'Wireless Overview'} isFetching={isFetching} refetch={refetch}>
            {Object.entries(radios).map(([radioName, radio]) => (
                <RadioSection
                    key={radioName}
                    radioName={radioName}
                    radio={radio}
                    onScan={handleScan}
                    onEdit={handleEdit}
                    onAdd={handleAdd}
                    onConfigure={handleConfigure}
                />
            ))}

            <ScanModal
                show={scanModal.show}
                onHide={() => setScanModal({ show: false, radioName: '' })}
                radioName={scanModal.radioName}
                onConnect={handleConnectFromScan}
            />
            <InterfaceFormModal
                show={formModal.show}
                onHide={() => setFormModal({ show: false, radio: null, section: null, initialValues: null })}
                radio={formModal.radio}
                section={formModal.section}
                initialValues={formModal.initialValues}
            />
            <RadioConfigModal
                show={radioConfigModal.show}
                onHide={() => setRadioConfigModal({ show: false, radioName: '', band: '' })}
                radioName={radioConfigModal.radioName}
                band={radioConfigModal.band}
            />
        </PanelCard>
    );
};

export default WirelessOverviewCard;
