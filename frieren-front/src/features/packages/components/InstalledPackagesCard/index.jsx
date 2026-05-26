/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import { useAtomValue, useSetAtom } from 'jotai';

import PanelCard from '@src/components/PanelCard';
import TablePagination from '@src/components/TablePagination';
import SearchInput from '@src/components/SearchInput';
import Button from '@src/components/Button';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import useInstalledPackages from '@src/features/packages/hooks/useInstalledPackages.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import removingPackageAtom from '@src/features/packages/atoms/removingPackageAtom.js';

/**
 * Displays installed packages with search and remove actions.
 *
 * @return {ReactElement} The InstalledPackagesCard component.
 */
const InstalledPackagesCard = () => {
    const installedPackages = useAtomValue(installedPackagesAtom);
    const setSelectedPackage = useSetAtom(selectedPackageAtom);
    const removingName = useAtomValue(removingPackageAtom);
    const { load, isPolling, isLoaded } = useInstalledPackages();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const filteredPackages = useMemo(() => {
        if (!debouncedSearch) {
            return installedPackages;
        }
        const term = debouncedSearch.toLowerCase();
        return installedPackages.filter((pkg) =>
            pkg.name.toLowerCase().includes(term)
        );
    }, [installedPackages, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredPackages);

    return (
        <PanelCard
            title={'Installed Packages'}
            showRefresh={true}
            refetch={load}
            isFetching={isPolling}
            isLoading={isPolling}
        >
            {isLoaded && (
                <>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={'Search installed packages...'}
                    />

                    <Table striped hover responsive>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Version</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pageData.map((pkg) => (
                            <tr key={pkg.name}>
                                <td>{pkg.name}</td>
                                <td>{pkg.version}</td>
                                <td>{pkg.description}</td>
                                <td>
                                    <Button
                                        variant={'outline-danger'}
                                        size={'sm'}
                                        icon={'trash-2'}
                                        loading={removingName === pkg.name}
                                        disabled={!!removingName}
                                        onClick={() => setSelectedPackage(pkg)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredPackages.length === 0 && (
                            <tr>
                                <td colSpan={4}>No packages found.</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredPackages.length}
                    />
                </>
            )}
        </PanelCard>
    );
};

export default InstalledPackagesCard;
