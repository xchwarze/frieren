/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Badge, Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

import useScanRadio from '@src/features/wireless/hooks/useScanRadio.js';

const getSignalVariant = (signal) => {
    const value = parseInt(signal, 10);
    if (isNaN(value)) return 'secondary';
    if (value >= -60) return 'success';
    if (value >= -75) return 'warning';
    return 'danger';
};

const ScanModal = ({ show, onHide, radioName, onConnect }) => {
    const { mutate: scanRadio, isPending: isScanning, data: scanResults, reset: resetScan } = useScanRadio();
    const [sortField, setSortField] = useState('signal');

    useEffect(() => {
        if (show && radioName) {
            scanRadio({ radioName });
        }
        if (!show) {
            resetScan();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, radioName]);

    const handleRescan = useCallback(() => {
        if (radioName) {
            scanRadio({ radioName });
        }
    }, [scanRadio, radioName]);

    const handleConnect = useCallback((network) => {
        onConnect(network);
    }, [onConnect]);

    const sortedResults = (scanResults || []).slice().sort((a, b) => {
        if (sortField === 'signal') return (b.signal ?? -999) - (a.signal ?? -999);
        if (sortField === 'channel') return (a.channel ?? 0) - (b.channel ?? 0);
        if (sortField === 'ssid') return (a.ssid || '').localeCompare(b.ssid || '');
        return 0;
    });

    const renderBody = () => {
        if (isScanning) {
            return (
                <div className={'text-center py-4'}>
                    <Spinner animation={'border'} />
                    <p className={'mt-2 text-muted'}>Scanning for networks…</p>
                </div>
            );
        }

        if (!scanResults) {
            return (
                <p className={'text-muted'}>No scan results yet.</p>
            );
        }

        if (!scanResults.length) {
            return (
                <p className={'text-muted'}>No networks found.</p>
            );
        }

        return (
            <Table size={'sm'} striped bordered hover responsive>
                <thead>
                    <tr>
                        <th role={'button'} onClick={() => setSortField('ssid')}>SSID</th>
                        <th>BSSID</th>
                        <th role={'button'} onClick={() => setSortField('channel')}>Ch</th>
                        <th role={'button'} onClick={() => setSortField('signal')}>Signal</th>
                        <th>Security</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedResults.map((net, idx) => (
                        <tr key={idx}>
                            <td>{net.ssid || '(hidden)'}</td>
                            <td><code>{net.bssid}</code></td>
                            <td>{net.channel}</td>
                            <td>
                                <Badge bg={getSignalVariant(net.signal ?? net.quality)}>
                                    {net.signal ?? net.quality}
                                </Badge>
                            </td>
                            <td>{net.security || 'Open'}</td>
                            <td>
                                <Button
                                    size={'sm'}
                                    variant={'outline-primary'}
                                    onClick={() => handleConnect(net)}
                                >
                                    Connect
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size={'lg'} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Scan Results
                    {radioName && <small className={'text-muted ms-2 fs-6'}>{radioName}</small>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderBody()}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={'outline-info'}
                    onClick={handleRescan}
                    disabled={isScanning || !radioName}
                >
                    {isScanning ? 'Scanning…' : 'Re-scan'}
                </Button>
                <Button variant={'secondary'} onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ScanModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    radioName: PropTypes.string,
    onConnect: PropTypes.func.isRequired,
};

export default ScanModal;
