/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Badge, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';
import PanelTable from '@src/components/PanelTable';
import Loading from '@src/components/Loading';
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

    const sortedResults = useMemo(() => (
        results.slice().sort((left, right) => {
            if (sortField === 'signal') return (right.signal ?? -999) - (left.signal ?? -999);
            if (sortField === 'channel') return (left.channel ?? 0) - (right.channel ?? 0);
            if (sortField === 'ssid') return (left.ssid || '').localeCompare(right.ssid || '');
            return 0;
        })
    ), [results, sortField]);

    const renderSortHeader = (field, label) => (
        <th
            role={'button'}
            tabIndex={0}
            aria-sort={sortField === field ? (field === 'channel' ? 'ascending' : 'descending') : 'none'}
            onClick={() => setSortField(field)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSortField(field);
                }
            }}
        >
            {label}
        </th>
    );

    const renderBody = () => {
        if (results.length === 0 && isFetching) {
            return (
                <div className={'text-center py-4'}>
                    <Loading />
                </div>
            );
        }

        if (results.length === 0) {
            return <p className={'text-body-secondary'}>No networks found.</p>;
        }

        return (
            <PanelTable>
                <thead>
                    <tr>
                        {renderSortHeader('ssid', 'SSID')}
                        <th>BSSID</th>
                        {renderSortHeader('channel', 'Ch')}
                        {renderSortHeader('signal', 'Signal')}
                        <th>Security</th>
                        <th className={'visually-hidden'}>Connect</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedResults.map((net) => (
                        <tr key={net.bssid}>
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
                                    title={'Connect'}
                                    onClick={() => onConnect(net)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </PanelTable>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size={'lg'} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Scan Results
                    {radioName && <small className={'text-body-secondary ms-2 fs-6'}>{radioName}</small>}
                    {isFetching && results.length > 0 && (
                        <Spinner animation={'border'} size={'sm'} className={'ms-2'} />
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderBody()}
            </Modal.Body>
            <Modal.Footer>
                <small className={'text-body-secondary me-auto'}>
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
