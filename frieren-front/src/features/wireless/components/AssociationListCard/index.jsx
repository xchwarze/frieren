/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import { Table, Form, Badge } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import { getSignalVariant } from '@src/features/wireless/helpers/signalHelper.js';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import useGetAssociationList from '@src/features/wireless/hooks/useGetAssociationList.js';

const parseRate = (rate) => parseFloat(rate) || 0;

const SORT_FIELDS = {
    mac: (a, b) => a.mac.localeCompare(b.mac),
    signal: (a, b) => b.signal - a.signal,
    noise: (a, b) => b.noise - a.noise,
    rx_rate: (a, b) => parseRate(b.rx_rate) - parseRate(a.rx_rate),
    tx_rate: (a, b) => parseRate(b.tx_rate) - parseRate(a.tx_rate),
};

/**
 * Displays associated stations for a selected AP interface with sortable columns.
 *
 * @return {ReactElement} The AssociationListCard component.
 */
const AssociationListCard = () => {
    const { data: overview } = useGetWirelessOverview();
    const [selectedInterface, setSelectedInterface] = useState('');
    const [sortField, setSortField] = useState('signal');

    const allInterfaces = Object.values(overview ?? {}).flatMap(
        radio => (radio.interfaces ?? [])
            .filter(i => (i.mode === 'ap' || i.mode === 'Master') && i.ifname)
            .map(i => i.ifname)
    );

    const actualInterface = selectedInterface || allInterfaces[0] || '';
    const { data: clients, refetch, isFetching } = useGetAssociationList(actualInterface);
    const clientList = clients ?? [];

    const sorted = useMemo(() => (
        [...clientList].sort(SORT_FIELDS[sortField])
    ), [clientList, sortField]);

    const renderSortHeader = (field, label) => (
        <th role={'button'} onClick={() => setSortField(field)}>
            {label} {sortField === field && '▼'}
        </th>
    );

    return (
        <PanelCard
            title={'Associated Stations'}
            isFetching={isFetching}
            refetch={refetch}
            className={'mt-4'}
        >
            {allInterfaces.length > 0 && (
                <Form.Group className={'mb-3'}>
                    <Form.Label>Interface</Form.Label>
                    <Form.Select value={actualInterface} onChange={(e) => setSelectedInterface(e.target.value)}>
                        {allInterfaces.map(iface => (
                            <option key={iface} value={iface}>{iface}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}
            {sorted.length > 0 ? (
                <Table striped hover responsive>
                    <thead>
                        <tr>
                            {renderSortHeader('mac', 'MAC Address')}
                            {renderSortHeader('signal', 'Signal')}
                            {renderSortHeader('noise', 'Noise')}
                            {renderSortHeader('rx_rate', 'RX Rate')}
                            {renderSortHeader('tx_rate', 'TX Rate')}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((client, idx) => (
                            <tr key={idx}>
                                <td><code>{client.mac}</code></td>
                                <td>
                                    <Badge bg={getSignalVariant(client.signal)}>
                                        {client.signal} dBm
                                    </Badge>
                                </td>
                                <td>{client.noise} dBm</td>
                                <td>{client.rx_rate}</td>
                                <td>{client.tx_rate}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p className={'text-muted'}>No associated stations</p>
            )}
        </PanelCard>
    );
};

export default AssociationListCard;
