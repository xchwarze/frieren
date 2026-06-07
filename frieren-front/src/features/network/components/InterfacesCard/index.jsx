/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import Badge from 'react-bootstrap/Badge';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import Button from '@src/components/Button';
import ActionButtons from '@src/components/ActionButtons';
import useGetInterfaces from '@src/features/network/hooks/useGetInterfaces.js';
import useToggleInterface from '@src/features/network/hooks/useToggleInterface.js';
import InterfaceFormModal from '@src/features/network/components/InterfaceFormModal';

/**
 * Lists network interfaces with status, addressing and up/down/edit controls.
 *
 * @return {ReactElement} The InterfacesCard component.
 */
const InterfacesCard = () => {
    const interfacesQuery = useGetInterfaces();
    const { isSuccess } = interfacesQuery;
    const { mutateAsync: toggleMutation } = useToggleInterface();

    const [busyName, setBusyName] = useState(null);
    const [editing, setEditing] = useState(null);

    const interfaces = interfacesQuery?.data?.interfaces ?? [];

    const runToggle = async (name, action) => {
        setBusyName(name);
        try {
            await toggleMutation({ name, action });
        } finally {
            setBusyName(null);
        }
    };

    const renderContent = () => {
        if (!isSuccess) {
            return (
                <SkeletonTable
                    headers={['Name', 'Proto', 'IP / Netmask', 'Gateway', 'Status', 'Device', 'Uptime', 'Action']}
                    widths={[90, 60, 160, 110, 70, 90, 80, 150]}
                />
            );
        }

        return (
            <PanelTable>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Proto</th>
                        <th>IP / Netmask</th>
                        <th>Gateway</th>
                        <th>Status</th>
                        <th>Device</th>
                        <th>Uptime</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {interfaces.map((iface) => {
                        const busy = busyName === iface.name;

                        return (
                            <tr key={iface.name}>
                                <td><code>{iface.name}</code></td>
                                <td>{iface.proto}</td>
                                <td>
                                    {iface.ipaddr
                                        ? `${iface.ipaddr}${iface.netmask ? ` / ${iface.netmask}` : ''}`
                                        : '-'}
                                </td>
                                <td>{iface.gateway || '-'}</td>
                                <td>
                                    <Badge bg={iface.up ? 'success' : 'secondary'}>
                                        {iface.up ? 'Up' : 'Down'}
                                    </Badge>
                                </td>
                                <td>{iface.device || '-'}</td>
                                <td>{iface.uptime || '-'}</td>
                                <td>
                                    <ActionButtons>
                                        <Button
                                            icon={'arrow-up'}
                                            variant={'outline-success'}
                                            size={'sm'}
                                            title={'Bring up'}
                                            loading={busy}
                                            disabled={busy || iface.up}
                                            onClick={() => runToggle(iface.name, 'up')}
                                        />
                                        <Button
                                            icon={'arrow-down'}
                                            variant={'outline-danger'}
                                            size={'sm'}
                                            title={'Bring down'}
                                            loading={busy}
                                            disabled={busy || !iface.up}
                                            onClick={() => runToggle(iface.name, 'down')}
                                        />
                                        <Button
                                            icon={'edit'}
                                            variant={'outline-secondary'}
                                            size={'sm'}
                                            title={'Edit'}
                                            disabled={busy}
                                            onClick={() => setEditing(iface)}
                                        />
                                    </ActionButtons>
                                </td>
                            </tr>
                        );
                    })}
                    {interfaces.length === 0 && (
                        <tr>
                            <td colSpan={8}>No interfaces found.</td>
                        </tr>
                    )}
                </tbody>
            </PanelTable>
        );
    };

    return (
        <PanelCard
            title={'Interfaces'}
            subtitle={'Network interfaces and addressing'}
            refetch={interfacesQuery.refetch}
            isFetching={interfacesQuery.isFetching}
        >
            {renderContent()}

            <InterfaceFormModal
                show={editing !== null}
                onHide={() => setEditing(null)}
                iface={editing}
            />
        </PanelCard>
    );
};

export default InterfacesCard;
