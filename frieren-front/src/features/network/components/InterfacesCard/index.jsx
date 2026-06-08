/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import StatusBadge from '@src/components/StatusBadge';

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
    const { mutate: toggleInterface, isPending: isToggling } = useToggleInterface();

    const [togglingName, setTogglingName] = useState(null);
    const [editing, setEditing] = useState(null);

    const interfaces = interfacesQuery?.data?.interfaces ?? [];

    const handleToggle = (iface) => {
        setTogglingName(iface.name);
        toggleInterface({ name: iface.name, action: iface.up ? 'down' : 'up' });
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
                        const busy = isToggling && togglingName === iface.name;

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
                                    <StatusBadge status={iface.up ? 'up' : 'down'}>
                                        {iface.up ? 'Up' : 'Down'}
                                    </StatusBadge>
                                </td>
                                <td>{iface.device || '-'}</td>
                                <td>{iface.uptime || '-'}</td>
                                <td>
                                    <ActionButtons>
                                        <Button
                                            icon={'edit-2'}
                                            variant={'outline-primary'}
                                            size={'sm'}
                                            title={'Edit'}
                                            disabled={busy}
                                            onClick={() => setEditing(iface)}
                                        />
                                        <Button
                                            icon={iface.up ? 'toggle-right' : 'toggle-left'}
                                            variant={iface.up ? 'outline-danger' : 'outline-success'}
                                            size={'sm'}
                                            title={iface.up ? 'Bring down' : 'Bring up'}
                                            loading={busy}
                                            disabled={busy}
                                            onClick={() => handleToggle(iface)}
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
            icon={'share-2'}
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
