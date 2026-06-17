/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import { Form, Badge } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import { getSignalVariant } from '@src/features/wireless/helpers/signalHelper.js';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import useGetAssociationList from '@src/features/wireless/hooks/useGetAssociationList.js';

const parseRate = (rate) => parseFloat(rate) || 0;

const SORT_FIELDS = {
    mac: (left, right) => left.mac.localeCompare(right.mac),
    signal: (left, right) => right.signal - left.signal,
    noise: (left, right) => right.noise - left.noise,
    rx_rate: (left, right) => parseRate(right.rx_rate) - parseRate(left.rx_rate),
    tx_rate: (left, right) => parseRate(right.tx_rate) - parseRate(left.tx_rate),
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
            .filter(iface => (iface.mode === 'ap' || iface.mode === 'Master') && iface.ifname)
            .map(iface => iface.ifname)
    );

    const actualInterface = selectedInterface || allInterfaces[0] || '';
    const { data: clients, refetch, isFetching } = useGetAssociationList(actualInterface);
    const clientList = clients ?? [];

    const sorted = useMemo(() => (
        [...clientList].sort(SORT_FIELDS[sortField])
    ), [clientList, sortField]);

    const renderSortHeader = (field, label) => (
        <th
            role={'button'}
            tabIndex={0}
            aria-sort={sortField === field ? 'descending' : 'none'}
            onClick={() => setSortField(field)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSortField(field);
                }
            }}
        >
            {label} {sortField === field && '▼'}
        </th>
    );

    return (
        <PanelCard
            title={'Associated Stations'}
            icon={'users'}
            subtitle={'Associated clients'}
            isFetching={isFetching}
            refetch={refetch}
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
            <PanelTable>
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
                    {sorted.map((client) => (
                        <tr key={client.mac}>
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
                    {sorted.length === 0 && (
                        <tr>
                            <td colSpan={5}>No associated stations</td>
                        </tr>
                    )}
                </tbody>
            </PanelTable>
        </PanelCard>
    );
};

export default AssociationListCard;
