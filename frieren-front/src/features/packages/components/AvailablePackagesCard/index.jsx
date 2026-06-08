/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo, useCallback, memo } from 'react';
import { useAtomValue } from 'jotai';
import PropTypes from 'prop-types';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonBar from '@src/components/SkeletonBar';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import TablePagination from '@src/components/TablePagination';
import SearchInput from '@src/components/SearchInput';
import Button from '@src/components/Button';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import useAvailablePackages from '@src/features/packages/hooks/useAvailablePackages.js';
import useUpdateLists from '@src/features/packages/hooks/useUpdateLists.js';
import useInstallPackage from '@src/features/packages/hooks/useInstallPackage.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';

const PackageTable = memo(({ packages, isInstalling, installingName, installedNames, onInstall }) => (
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
        {packages.map((pkg) => (
            <tr key={pkg.name}>
                <td>{pkg.name}</td>
                <td>{pkg.version}</td>
                <td>{pkg.description}</td>
                <td>
                    {!installedNames.has(pkg.name) && (
                        <Button
                            variant={'outline-primary'}
                            size={'sm'}
                            icon={'download'}
                            title={'Install package'}
                            disabled={isInstalling}
                            loading={isInstalling && installingName === pkg.name}
                            onClick={() => onInstall(pkg)}
                        />
                    )}
                </td>
            </tr>
        ))}
        {packages.length === 0 && (
            <tr>
                <td colSpan={4}>No packages found.</td>
            </tr>
        )}
        </tbody>
    </PanelTable>
));

PackageTable.displayName = 'PackageTable';

PackageTable.propTypes = {
    packages: PropTypes.arrayOf(PropTypes.object).isRequired,
    isInstalling: PropTypes.bool.isRequired,
    installingName: PropTypes.string.isRequired,
    installedNames: PropTypes.instanceOf(Set).isRequired,
    onInstall: PropTypes.func.isRequired,
};

/**
 * Displays available packages with update lists flow, search and install actions.
 *
 * @return {ReactElement} The AvailablePackagesCard component.
 */
const AvailablePackagesCard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const availablePackages = useAtomValue(availablePackagesAtom);
    const installedPackages = useAtomValue(installedPackagesAtom);

    const { load: loadAvailable, isPolling: isLoadingAvailable, isLoaded, isPending: isLoadPending } = useAvailablePackages();
    const { update, isPolling: isUpdating, isPending: isUpdatePending } = useUpdateLists({
        onCompleted: () => loadAvailable(),
    });
    const { install, isPolling: isInstalling, installingName } = useInstallPackage();

    const isBusy = isUpdatePending || isUpdating || isLoadingAvailable || isLoadPending;

    const installedNames = useMemo(
        () => new Set(installedPackages.map((pkg) => pkg.name)),
        [installedPackages],
    );

    const handleInstallClick = useCallback((pkg) => {
        install({ packageName: pkg.name });
    }, [install]);

    const filteredPackages = useMemo(() => {
        if (!debouncedSearch) {
            return availablePackages;
        }
        const term = debouncedSearch.toLowerCase();
        return availablePackages.filter((pkg) =>
            pkg.name.toLowerCase().includes(term) ||
            (pkg.description ?? '').toLowerCase().includes(term)
        );
    }, [availablePackages, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredPackages);

    return (
        <PanelCard
            title={'Available Packages'}
            icon={'download'}
            subtitle={'Update the package lists and browse available packages for installation.'}
            showRefresh={isLoaded}
            refetch={() => update()}
            isFetching={isBusy}
        >
            {!isLoaded && !isBusy && (
                <div className={'text-center'}>
                    <Button
                        label={'Update Lists'}
                        icon={'refresh-cw'}
                        onClick={() => update()}
                    />
                </div>
            )}

            {isBusy && (
                <>
                    <SkeletonBar width={250} height={38} barHeight={34} />
                    <SkeletonTable
                        headers={['Name', 'Version', 'Description', 'Action']}
                        widths={[120, 80, 200, 60]}
                        rows={5}
                    />
                </>
            )}

            {isLoaded && !isBusy && (
                <>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={'Search available packages...'}
                    />

                    <PackageTable
                        packages={pageData}
                        isInstalling={isInstalling}
                        installingName={installingName}
                        installedNames={installedNames}
                        onInstall={handleInstallClick}
                    />

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

export default AvailablePackagesCard;
