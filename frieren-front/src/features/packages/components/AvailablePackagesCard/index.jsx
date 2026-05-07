/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useMemo, memo } from 'react';
import Table from 'react-bootstrap/Table';
import BaseButton from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useAtomValue } from 'jotai';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import PanelCard from '@src/components/PanelCard';
import TablePagination from '@src/components/TablePagination';
import Button from '@src/components/Button';
import Icon from '@src/components/Icon';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import useUpdateLists from '@src/features/packages/hooks/useUpdateLists.js';
import useGetUpdateStatus from '@src/features/packages/hooks/useGetUpdateStatus.js';
import useInstallPackage from '@src/features/packages/hooks/useInstallPackage.js';
import useGetInstallStatus from '@src/features/packages/hooks/useGetInstallStatus.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';

const PackageTable = memo(({ packages, isInstalling, installingName, checkInstalled, onInstall }) => (
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
        {packages.map((pkg, index) => (
            <tr key={index}>
                <td>{pkg.name}</td>
                <td>{pkg.version}</td>
                <td>{pkg.description}</td>
                <td>
                    {!checkInstalled(pkg) && (
                        <BaseButton
                            variant={'outline-primary'}
                            size={'sm'}
                            disabled={isInstalling}
                            onClick={() => onInstall(pkg)}
                        >
                            {isInstalling && installingName === pkg.name ? (
                                <Spinner animation={'border'} size={'sm'} />
                            ) : (
                                <Icon name={'download'} />
                            )}
                        </BaseButton>
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
    </Table>
));

PackageTable.displayName = 'PackageTable';

PackageTable.propTypes = {
    packages: PropTypes.arrayOf(PropTypes.object).isRequired,
    isInstalling: PropTypes.bool.isRequired,
    installingName: PropTypes.string.isRequired,
    checkInstalled: PropTypes.func.isRequired,
    onInstall: PropTypes.func.isRequired,
};

/**
 * Displays available packages with update lists flow, search and install actions.
 *
 * @param {boolean} isLoading - Whether available packages are being loaded.
 * @param {boolean} isLoaded - Whether available packages have been loaded.
 * @param {Function} onLoadAvailable - Callback to trigger loading available packages.
 * @param {Function} onReloadInstalled - Callback to reload installed packages after install.
 * @return {ReactElement} The AvailablePackagesCard component.
 */
const AvailablePackagesCard = ({ isLoading, isLoaded, onLoadAvailable, onReloadInstalled }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installingName, setInstallingName] = useState('');

    const availablePackages = useAtomValue(availablePackagesAtom);
    const installedPackages = useAtomValue(installedPackagesAtom);
    const { mutate: updateLists, isPending: isUpdatePending } = useUpdateLists();
    const { mutate: installPackage } = useInstallPackage();
    const isBusy = isUpdatePending || isUpdating || isLoading;

    const updateStatusQuery = useGetUpdateStatus({ enabled: isUpdating });
    const installStatusQuery = useGetInstallStatus({ enabled: isInstalling });

    useEffect(() => {
        if (isUpdating && updateStatusQuery.data?.completed) {
            setIsUpdating(false);
            onLoadAvailable();
        }
    }, [isUpdating, updateStatusQuery.data, onLoadAvailable]);

    useEffect(() => {
        if (isInstalling && installStatusQuery.data?.completed) {
            setIsInstalling(false);
            toast.success(`Package ${installingName} successfully installed`);
            setInstallingName('');
            setTimeout(() => onReloadInstalled(), 500);
        }
    }, [isInstalling, installStatusQuery.data, installingName, onReloadInstalled]);

    const handleUpdateLists = () => {
        updateLists(undefined, {
            onSuccess: () => setIsUpdating(true),
        });
    };

    const handleInstallClick = (pkg) => {
        setInstallingName(pkg.name);
        installPackage({ packageName: pkg.name }, {
            onSuccess: () => setIsInstalling(true),
        });
    };

    const checkInstalled = (pkg) => (
        installedPackages.some((installed) => installed.name === pkg.name)
    );

    const filteredPackages = useMemo(() => {
        if (!debouncedSearch) {
            return availablePackages;
        }
        const term = debouncedSearch.toLowerCase();
        return availablePackages.filter((pkg) =>
            pkg.name.toLowerCase().includes(term)
        );
    }, [availablePackages, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredPackages);

    return (
        <PanelCard
            title={'Available Packages'}
            subtitle={'Update the package lists and browse available packages for installation.'}
            showRefresh={isLoaded}
            refetch={handleUpdateLists}
            isFetching={isBusy}
        >
            <>
                {!isLoaded && !isBusy && (
                    <div className={'text-center'}>
                        <Button
                            label={'Update Lists'}
                            icon={'refresh-cw'}
                            onClick={handleUpdateLists}
                        />
                    </div>
                )}

                {isBusy && (
                    <div className={'text-center'}>
                        <Spinner animation={'border'} className={'me-2'} />
                        <span>{isUpdating ? 'Updating package lists...' : 'Loading available packages...'}</span>
                    </div>
                )}

                {isLoaded && !isBusy && (
                    <>
                        <InputGroup className={'mb-3'}>
                            <InputGroup.Text>
                                <Icon name={'search'} />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder={'Search available packages...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>

                        <PackageTable
                            packages={pageData}
                            isInstalling={isInstalling}
                            installingName={installingName}
                            checkInstalled={checkInstalled}
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
            </>
        </PanelCard>
    );
};

AvailablePackagesCard.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isLoaded: PropTypes.bool.isRequired,
    onLoadAvailable: PropTypes.func.isRequired,
    onReloadInstalled: PropTypes.func.isRequired,
};

export default AvailablePackagesCard;
