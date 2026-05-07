/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { Table, Form, Badge } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import useGetAssociationList from '@src/features/wireless/hooks/useGetAssociationList.js';

const AssociationListCard = () => {
    const { data: overview } = useGetWirelessOverview();
    const [selectedInterface, setSelectedInterface] = useState('');

    const allInterfaces = Object.values(overview ?? {}).flatMap(
        radio => (radio.interfaces ?? [])
            .filter(i => (i.mode === 'ap' || i.mode === 'Master') && i.ifname)
            .map(i => i.ifname)
    );

    const actualInterface = selectedInterface || allInterfaces[0] || '';
    const { data: clients, refetch, isFetching } = useGetAssociationList(actualInterface);
    const clientList = clients ?? [];

    return (
        <PanelCard title={'Associated Stations'} isFetching={isFetching} refetch={refetch}>
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
            {clientList.length > 0 ? (
                <Table size={'sm'} striped bordered hover>
                    <thead>
                        <tr>
                            <th>MAC Address</th>
                            <th>Signal</th>
                            <th>Noise</th>
                            <th>RX Rate</th>
                            <th>TX Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientList.map((client, idx) => (
                            <tr key={idx}>
                                <td><code>{client.mac}</code></td>
                                <td>
                                    <Badge bg={client.signal >= -70 ? 'success' : client.signal >= -85 ? 'warning' : 'danger'}>
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
