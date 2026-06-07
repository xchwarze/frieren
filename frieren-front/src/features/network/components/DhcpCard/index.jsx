/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';

import PanelCard from '@src/components/PanelCard';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import TablePagination from '@src/components/TablePagination';
import SearchInput from '@src/components/SearchInput';
import Button from '@src/components/Button';
import ConfirmationModal from '@src/components/ConfirmationModal';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import useGetDhcpLeases from '@src/features/network/hooks/useGetDhcpLeases.js';
import useGetStaticLeases from '@src/features/network/hooks/useGetStaticLeases.js';
import useDeleteStaticLease from '@src/features/network/hooks/useDeleteStaticLease.js';
import AddStaticLeaseModal from './AddStaticLeaseModal';

const formatExpires = (expires) => {
    if (!expires) {
        return '-';
    }
    if (Number(expires) <= 0) {
        return 'Infinite';
    }

    return new Date(Number(expires) * 1000).toLocaleString();
};

/**
 * Displays active DHCP leases and configured static leases.
 *
 * @return {ReactElement} The DhcpCard component.
 */
const DhcpCard = () => {
    const leasesQuery = useGetDhcpLeases();
    const staticLeasesQuery = useGetStaticLeases();
    const { mutateAsync: deleteStaticLease, isPending: isDeleting } = useDeleteStaticLease();

    const [searchTerm, setSearchTerm] = useState('');
    const [adding, setAdding] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const debouncedSearch = useDebouncedValue(searchTerm);

    const leases = leasesQuery?.data?.leases ?? [];
    const staticLeases = staticLeasesQuery?.data?.leases ?? [];

    const filteredLeases = useMemo(() => {
        if (!debouncedSearch) {
            return leases;
        }
        const term = debouncedSearch.toLowerCase();
        return leases.filter((lease) =>
            [lease.hostname, lease.ip, lease.mac]
                .some((field) => (field ?? '').toLowerCase().includes(term))
        );
    }, [leases, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredLeases);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, setCurrentPage]);

    const confirmDelete = async () => {
        const mac = pendingDelete?.mac;
        try {
            await deleteStaticLease({ mac });
        } finally {
            setPendingDelete(null);
        }
    };

    const renderLeases = () => {
        if (!leasesQuery.isSuccess) {
            return (
                <SkeletonTable
                    headers={['Hostname', 'IP', 'MAC', 'Expires']}
                    widths={[140, 120, 160, 160]}
                />
            );
        }

        return (
            <>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={'Search leases...'}
                />

                <Table striped hover responsive>
                    <thead>
                        <tr>
                            <th>Hostname</th>
                            <th>IP</th>
                            <th>MAC</th>
                            <th>Expires</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((lease) => (
                            <tr key={`${lease.mac}-${lease.ip}`}>
                                <td>{lease.hostname || '-'}</td>
                                <td>{lease.ip}</td>
                                <td><code>{lease.mac}</code></td>
                                <td>{formatExpires(lease.expires)}</td>
                            </tr>
                        ))}
                        {filteredLeases.length === 0 && (
                            <tr>
                                <td colSpan={4}>No leases found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredLeases.length}
                />
            </>
        );
    };

    const renderStaticLeases = () => {
        if (!staticLeasesQuery.isSuccess) {
            return (
                <SkeletonTable
                    headers={['Name', 'MAC', 'IP', 'Action']}
                    widths={[140, 160, 120, 60]}
                />
            );
        }

        return (
            <Table striped hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>MAC</th>
                        <th>IP</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {staticLeases.map((lease) => (
                        <tr key={`${lease.mac}-${lease.ip}`}>
                            <td>{lease.name}</td>
                            <td><code>{lease.mac}</code></td>
                            <td>{lease.ip}</td>
                            <td>
                                <Button
                                    icon={'trash-2'}
                                    variant={'outline-danger'}
                                    size={'sm'}
                                    title={'Delete'}
                                    onClick={() => setPendingDelete(lease)}
                                />
                            </td>
                        </tr>
                    ))}
                    {staticLeases.length === 0 && (
                        <tr>
                            <td colSpan={4}>No static leases configured.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    };

    return (
        <>
            <div className={'d-flex flex-column gap-4'}>
                <PanelCard
                    title={'DHCP Leases'}
                    subtitle={'Active DHCP leases'}
                    refetch={leasesQuery.refetch}
                    isFetching={leasesQuery.isFetching}
                >
                    {renderLeases()}
                </PanelCard>

                <PanelCard
                    title={'Static Leases'}
                    subtitle={'Reserved address assignments'}
                    refetch={staticLeasesQuery.refetch}
                    isFetching={staticLeasesQuery.isFetching}
                >
                    <div className={'d-flex justify-content-end mb-3'}>
                        <Button
                            icon={'plus'}
                            label={'Add'}
                            onClick={() => setAdding(true)}
                        />
                    </div>

                    {renderStaticLeases()}
                </PanelCard>
            </div>

            <AddStaticLeaseModal
                show={adding}
                onHide={() => setAdding(false)}
            />

            <ConfirmationModal
                show={pendingDelete !== null}
                onHide={() => setPendingDelete(null)}
                onConfirm={confirmDelete}
                isConfirmLoading={isDeleting}
                title={'Delete static lease'}
                description={pendingDelete && (
                    <>
                        Remove the static lease for <code>{pendingDelete.name}</code>{' '}
                        (<code>{pendingDelete.mac}</code>)?
                    </>
                )}
            />
        </>
    );
};

export default DhcpCard;
