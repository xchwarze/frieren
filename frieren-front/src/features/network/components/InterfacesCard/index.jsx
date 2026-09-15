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
import ConfirmationModal from '@src/components/ConfirmationModal';
import useGetInterfaces from '@src/features/network/hooks/useGetInterfaces.js';
import useToggleInterface from '@src/features/network/hooks/useToggleInterface.js';
import useRemoveInterface from '@src/features/network/hooks/useRemoveInterface.js';
import InterfaceFormModal from '@src/features/network/components/InterfaceFormModal';

const HIDDEN_FORM_STATE = { show: false, iface: null };

/**
 * Lists network interfaces with status, addressing and add/edit/restart/toggle/delete
 * controls. No protected-interface list is hardcoded here: the delete confirmation
 * naming the interface is the safety net for this root-only, LAN-only admin panel.
 *
 * @return {ReactElement} The InterfacesCard component.
 */
const InterfacesCard = () => {
    const interfacesQuery = useGetInterfaces();
    const { isSuccess } = interfacesQuery;
    const { mutate: toggleInterface, isPending: isToggling } = useToggleInterface();
    const { mutateAsync: removeInterface, isPending: isRemoving } = useRemoveInterface();

    const [togglingName, setTogglingName] = useState(null);
    const [formState, setFormState] = useState(HIDDEN_FORM_STATE);
    const [pendingDelete, setPendingDelete] = useState(null);

    const interfaces = interfacesQuery?.data?.interfaces ?? [];

    const handleToggle = (iface, action) => {
        setTogglingName(iface.name);
        toggleInterface({ name: iface.name, action });
    };

    const confirmDelete = async () => {
        const name = pendingDelete?.name;
        try {
            await removeInterface({ name });
        } finally {
            setPendingDelete(null);
        }
    };

    const renderContent = () => {
        if (!isSuccess) {
            return (
                <SkeletonTable
                    headers={['Name', 'Proto', 'IP / Netmask', 'Gateway', 'Status', 'Device', 'Uptime', 'Action']}
                    widths={[90, 60, 160, 110, 70, 90, 80, 220]}
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
                                            onClick={() => setFormState({ show: true, iface })}
                                        />
                                        <Button
                                            icon={iface.up ? 'toggle-right' : 'toggle-left'}
                                            variant={iface.up ? 'outline-danger' : 'outline-success'}
                                            size={'sm'}
                                            title={iface.up ? 'Bring down' : 'Bring up'}
                                            loading={busy}
                                            disabled={busy}
                                            onClick={() => handleToggle(iface, iface.up ? 'down' : 'up')}
                                        />
                                        <Button
                                            icon={'refresh-cw'}
                                            variant={'outline-secondary'}
                                            size={'sm'}
                                            title={'Restart'}
                                            disabled={busy}
                                            onClick={() => handleToggle(iface, 'restart')}
                                        />
                                        <Button
                                            icon={'trash-2'}
                                            variant={'outline-danger'}
                                            size={'sm'}
                                            title={'Delete'}
                                            disabled={busy}
                                            onClick={() => setPendingDelete(iface)}
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
            <div className={'d-flex justify-content-end mb-3'}>
                <Button
                    icon={'plus'}
                    label={'Add'}
                    onClick={() => setFormState({ show: true, iface: null })}
                />
            </div>

            {renderContent()}

            <InterfaceFormModal
                show={formState.show}
                onHide={() => setFormState(HIDDEN_FORM_STATE)}
                iface={formState.iface}
            />

            <ConfirmationModal
                show={pendingDelete !== null}
                onHide={() => setPendingDelete(null)}
                onConfirm={confirmDelete}
                isConfirmLoading={isRemoving}
                title={'Delete interface'}
                description={pendingDelete && (
                    <>
                        Remove the interface <code>{pendingDelete.name}</code>? This cannot be undone.
                    </>
                )}
            />
        </PanelCard>
    );
};

export default InterfacesCard;
