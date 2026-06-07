/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMemo, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import TablePagination from '@src/components/TablePagination';
import SearchInput from '@src/components/SearchInput';
import Button from '@src/components/Button';
import ActionButtons from '@src/components/ActionButtons';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import useGetServices from '@src/features/system/hooks/useGetServices.js';
import useControlService from '@src/features/system/hooks/useControlService.js';
import useToggleEnabled from '@src/features/system/hooks/useToggleEnabled.js';

// Stopping/disabling these can lock the admin out of the device, so a disruptive
// action against them is gated behind a confirmation modal.
const CRITICAL_SERVICES = ['network', 'dropbear', 'uhttpd', 'firewall'];

/**
 * Lists init.d services with boot/running state and start/stop/restart controls.
 *
 * @return {ReactElement} The ServicesCard component.
 */
const ServicesCard = () => {
    const servicesQuery = useGetServices();
    const { isSuccess } = servicesQuery;
    const { mutateAsync: controlMutation } = useControlService();
    const { mutateAsync: toggleMutation } = useToggleEnabled();

    const [searchTerm, setSearchTerm] = useState('');
    const [busyName, setBusyName] = useState(null);
    const [pending, setPending] = useState(null);
    const debouncedSearch = useDebouncedValue(searchTerm);

    const services = servicesQuery?.data?.services ?? [];
    const filteredServices = useMemo(() => {
        if (!debouncedSearch) {
            return services;
        }
        const term = debouncedSearch.toLowerCase();
        return services.filter((svc) => svc.name.toLowerCase().includes(term));
    }, [services, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredServices);

    const runControl = async (name, command) => {
        setBusyName(name);
        try {
            await controlMutation({ name, command });
        } finally {
            setBusyName(null);
        }
    };

    const runToggle = async (name, enabled) => {
        setBusyName(name);
        try {
            await toggleMutation({ name, enabled });
        } finally {
            setBusyName(null);
        }
    };

    // A control verb other than `start`, or disabling on boot, is disruptive.
    const isDisruptive = (action) => action.command !== 'start' && !(action.type === 'toggle' && action.enabled);

    const requestAction = (action) => {
        if (CRITICAL_SERVICES.includes(action.name) && isDisruptive(action)) {
            setPending(action);

            return;
        }

        action.type === 'toggle'
            ? runToggle(action.name, action.enabled)
            : runControl(action.name, action.command);
    };

    const confirmPending = async () => {
        const action = pending;
        setPending(null);
        action.type === 'toggle'
            ? await runToggle(action.name, action.enabled)
            : await runControl(action.name, action.command);
    };

    const renderContent = () => {
        if (!isSuccess) {
            return (
                <SkeletonTable
                    headers={['Service', 'On Boot', 'Status', 'Action']}
                    widths={[200, 90, 90, 190]}
                />
            );
        }

        return (
            <>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={'Search services...'}
                />

                <PanelTable>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>On Boot</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((svc) => {
                            const busy = busyName === svc.name;
                            const critical = CRITICAL_SERVICES.includes(svc.name);

                            return (
                                <tr key={svc.name}>
                                    <td>
                                        <code>{svc.name}</code>
                                        {critical && (
                                            <Badge bg={'warning'} text={'dark'} className={'ms-2'}>
                                                critical
                                            </Badge>
                                        )}
                                    </td>
                                    <td>
                                        <Form.Check
                                            type={'switch'}
                                            checked={svc.enabled}
                                            disabled={busy}
                                            onChange={() => requestAction({
                                                type: 'toggle',
                                                name: svc.name,
                                                enabled: !svc.enabled,
                                            })}
                                            aria-label={`Toggle ${svc.name} on boot`}
                                        />
                                    </td>
                                    <td>
                                        <Badge bg={svc.running ? 'success' : 'secondary'}>
                                            {svc.running ? 'Running' : 'Stopped'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <ActionButtons>
                                            <Button
                                                icon={'play'}
                                                variant={'outline-success'}
                                                size={'sm'}
                                                title={'Start'}
                                                aria-label={'Start'}
                                                loading={busy}
                                                onClick={() => requestAction({ type: 'control', name: svc.name, command: 'start' })}
                                            />
                                            <Button
                                                icon={'square'}
                                                variant={'outline-danger'}
                                                size={'sm'}
                                                title={'Stop'}
                                                aria-label={'Stop'}
                                                disabled={busy}
                                                onClick={() => requestAction({ type: 'control', name: svc.name, command: 'stop' })}
                                            />
                                            <Button
                                                icon={'refresh-cw'}
                                                variant={'outline-secondary'}
                                                size={'sm'}
                                                title={'Restart'}
                                                aria-label={'Restart'}
                                                disabled={busy}
                                                onClick={() => requestAction({ type: 'control', name: svc.name, command: 'restart' })}
                                            />
                                        </ActionButtons>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredServices.length === 0 && (
                            <tr>
                                <td colSpan={4}>No services found.</td>
                            </tr>
                        )}
                    </tbody>
                </PanelTable>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredServices.length}
                />
            </>
        );
    };

    return (
        <PanelCard
            title={'Init Services'}
            icon={'server'}
            subtitle={'Manage init.d services'}
            refetch={servicesQuery.refetch}
            isFetching={servicesQuery.isFetching}
        >
            {renderContent()}

            <ConfirmationModal
                show={pending !== null}
                onHide={() => setPending(null)}
                onConfirm={confirmPending}
                title={'Confirm action'}
                description={pending && (
                    <>
                        <code>{pending.name}</code> is a critical service. {pending.type === 'toggle'
                            ? 'Disabling it on boot'
                            : `Running "${pending.command}"`} may disrupt connectivity or lock you out of the device. Continue?
                    </>
                )}
            />
        </PanelCard>
    );
};

export default ServicesCard;
