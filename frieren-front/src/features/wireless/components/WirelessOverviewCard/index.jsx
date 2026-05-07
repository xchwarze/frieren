/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useCallback } from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import PanelCard from '@src/components/PanelCard';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import useRemoveInterface from '@src/features/wireless/hooks/useRemoveInterface.js';
import useToggleInterface from '@src/features/wireless/hooks/useToggleInterface.js';
import useDisableWwanInterface from '@src/features/wireless/hooks/useDisableWwanInterface.js';
import ScanModal from '@src/features/wireless/components/ScanModal';
import InterfaceFormModal from '@src/features/wireless/components/InterfaceFormModal';
import RadioConfigModal from '@src/features/wireless/components/RadioConfigModal';

const mapScanSecurityToEncryption = (security) => {
    if (!security || security === 'Open') return 'none';
    if (security.includes('WPA3-SAE')) return 'sae';
    if (security.includes('WPA2-PSK')) return 'psk2+ccmp';
    if (security.includes('WPA-PSK')) return 'psk-mixed+ccmp';
    return 'psk2+ccmp';
};

const RadioSection = ({ radioName, radio, onScan, onEdit, onAdd, onConfigure }) => {
    const { mutate: removeInterface } = useRemoveInterface();
    const { mutate: toggleInterface } = useToggleInterface();
    const { mutate: disableWwan, isPending: isDisconnecting } = useDisableWwanInterface();

    const [confirmRemove, setConfirmRemove] = useState(null);

    const handleToggle = useCallback((iface) => {
        toggleInterface({ section: iface.section, disabled: !iface.disabled });
    }, [toggleInterface]);

    const handleRemoveConfirmed = useCallback(() => {
        if (confirmRemove) {
            removeInterface({ section: confirmRemove });
        }
        setConfirmRemove(null);
    }, [removeInterface, confirmRemove]);

    const handleDisconnect = useCallback((iface) => {
        disableWwan({ interface: iface.ifname });
    }, [disableWwan]);

    return (
        <div className={'mb-3'}>
            <div className={'d-flex align-items-center justify-content-between mb-2'}>
                <h6 className={'mb-0'}>
                    {radioName}
                    <Badge bg={'secondary'} className={'ms-2'}>{radio.band || 'Unknown'}</Badge>
                    <Badge bg={radio.disabled ? 'danger' : (radio.up ? 'success' : 'warning')} className={'ms-1'}>
                        {radio.disabled ? 'Disabled' : (radio.up ? 'Up' : 'Down')}
                    </Badge>
                    <small className={'text-muted ms-2'}>
                        {radio.hardware ? `${radio.hardware} | ` : ''}
                        Channel {radio.channel} | {radio.htmode}
                        {radio.hwmodes ? ` | ${radio.hwmodes}` : ''}
                    </small>
                </h6>
                <div className={'d-flex gap-1'}>
                    <Button
                        size={'sm'}
                        variant={'outline-secondary'}
                        onClick={() => onConfigure(radioName, radio.band)}
                    >
                        Configure
                    </Button>
                    <Button
                        size={'sm'}
                        variant={'outline-info'}
                        onClick={() => onScan(radioName)}
                    >
                        Scan
                    </Button>
                    <Button
                        size={'sm'}
                        variant={'outline-success'}
                        onClick={() => onAdd(radioName)}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {radio.interfaces?.length > 0 ? (
                <Table size={'sm'} striped bordered hover>
                    <thead>
                        <tr>
                            <th>Interface</th>
                            <th>SSID</th>
                            <th>Mode</th>
                            <th>BSSID</th>
                            <th>Encryption</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {radio.interfaces.map((iface, idx) => (
                            <tr key={idx}>
                                <td>{iface.ifname || iface.section}</td>
                                <td>{iface.ssid || '-'}</td>
                                <td>{iface.mode}</td>
                                <td><code>{iface.bssid || '-'}</code></td>
                                <td>{iface.encryption || 'None'}</td>
                                <td>
                                    <Badge bg={iface.disabled ? 'secondary' : (iface.up ? 'success' : 'danger')}>
                                        {iface.disabled ? 'Disabled' : (iface.up ? 'Up' : 'Down')}
                                    </Badge>
                                </td>
                                <td>
                                    <div className={'d-flex gap-1'}>
                                        <Button
                                            size={'sm'}
                                            variant={'outline-primary'}
                                            onClick={() => onEdit(iface.section)}
                                            disabled={!iface.section}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size={'sm'}
                                            variant={iface.disabled ? 'outline-success' : 'outline-warning'}
                                            onClick={() => handleToggle(iface)}
                                            disabled={!iface.section}
                                        >
                                            {iface.disabled ? 'Enable' : 'Disable'}
                                        </Button>
                                        {iface.mode === 'sta' && iface.up && (
                                            <Button
                                                size={'sm'}
                                                variant={'outline-danger'}
                                                onClick={() => handleDisconnect(iface)}
                                                disabled={isDisconnecting}
                                            >
                                                Disconnect
                                            </Button>
                                        )}
                                        <Button
                                            size={'sm'}
                                            variant={'outline-danger'}
                                            onClick={() => setConfirmRemove(iface.section)}
                                            disabled={!iface.section}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className={'text-muted'}>No interfaces configured</p>
            )}

            <ConfirmationModal
                show={!!confirmRemove}
                onHide={() => setConfirmRemove(null)}
                onConfirm={handleRemoveConfirmed}
                title={'Remove Interface'}
                description={`Are you sure you want to remove interface "${confirmRemove}"? This cannot be undone.`}
            />
        </div>
    );
};

RadioSection.propTypes = {
    radioName: PropTypes.string.isRequired,
    radio: PropTypes.object.isRequired,
    onScan: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onConfigure: PropTypes.func.isRequired,
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
