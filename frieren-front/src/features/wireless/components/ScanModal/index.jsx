/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import { getSignalVariant } from '@src/features/wireless/helpers/signalHelper.js';
import useScanRadio from '@src/features/wireless/hooks/useScanRadio.js';

const ScanModal = ({ show, onHide, radioName, onConnect }) => {
    const [autoScan, setAutoScan] = useState(true);
    const { data: scanData, isFetching } = useScanRadio(radioName, show && autoScan);
    const [results, setResults] = useState([]);
    const [sortField, setSortField] = useState('signal');

    const mergeResults = useCallback((newResults) => {
        setResults(prev => {
            const map = new Map(prev.map(result => [result.bssid, result]));
            for (const result of newResults) {
                const existing = map.get(result.bssid);
                if (!existing || (result.signal ?? -999) > (existing.signal ?? -999)) {
                    map.set(result.bssid, result);
                }
            }
            return Array.from(map.values());
        });
    }, []);

    useEffect(() => {
        if (!show) {
            setResults([]);
            setAutoScan(true);
        }
    }, [show]);

    useEffect(() => {
        if (Array.isArray(scanData)) {
            mergeResults(scanData);
        }
    }, [scanData, mergeResults]);

    const sortedResults = results.slice().sort((left, right) => {
        if (sortField === 'signal') return (right.signal ?? -999) - (left.signal ?? -999);
        if (sortField === 'channel') return (left.channel ?? 0) - (right.channel ?? 0);
        if (sortField === 'ssid') return (left.ssid || '').localeCompare(right.ssid || '');
        return 0;
    });

    const renderBody = () => {
        if (results.length === 0 && isFetching) {
            return (
                <div className={'text-center py-4'}>
                    <Spinner animation={'border'} />
                    <p className={'mt-2 text-muted'}>Scanning for networks…</p>
                </div>
            );
        }

        if (results.length === 0) {
            return <p className={'text-muted'}>No networks found.</p>;
        }

        return (
            <Table striped hover responsive>
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
                                    icon={'log-in'}
                                    onClick={() => onConnect(net)}
                                />
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
                    {isFetching && results.length > 0 && (
                        <Spinner animation={'border'} size={'sm'} className={'ms-2'} />
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderBody()}
            </Modal.Body>
            <Modal.Footer>
                <small className={'text-muted me-auto'}>
                    {results.length} network{results.length !== 1 ? 's' : ''} found
                    {isFetching ? ' · scanning…' : ''}
                </small>
                <Button
                    variant={autoScan ? 'outline-warning' : 'outline-success'}
                    icon={autoScan ? 'pause' : 'play'}
                    label={autoScan ? 'Pause' : 'Resume'}
                    onClick={() => setAutoScan(prev => !prev)}
                />
                <Button variant={'secondary'} icon={'x'} label={'Close'} onClick={onHide} />
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
