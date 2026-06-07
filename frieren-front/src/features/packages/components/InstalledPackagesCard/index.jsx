/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
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

    const renderContent = () => {
        if (!isLoaded) {
            return (
                <SkeletonTable
                    headers={['Name', 'Version', 'Description', 'Action']}
                    widths={[120, 80, 200, 60]}
                />
            );
        }

        return (
            <>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder={'Search installed packages...'}
                />

                <PanelTable>
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
                </PanelTable>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredPackages.length}
                />
            </>
        );
    };

    return (
        <PanelCard
            title={'Installed Packages'}
            subtitle={'Currently installed packages'}
            showRefresh={true}
            refetch={load}
            isFetching={isPolling}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default InstalledPackagesCard;
