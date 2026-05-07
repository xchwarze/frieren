/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import { useAtomValue, useSetAtom } from 'jotai';
import PropTypes from 'prop-types';

import PanelCard from '@src/components/PanelCard';
import TablePagination from '@src/components/TablePagination';
import Icon from '@src/components/Icon';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';

/**
 * Displays installed packages with search and remove actions.
 *
 * @param {boolean} isLoading - Whether installed packages are being loaded.
 * @param {boolean} isLoaded - Whether installed packages have been loaded.
 * @param {Function} onReload - Callback to reload installed packages.
 * @return {ReactElement} The InstalledPackagesCard component.
 */
const InstalledPackagesCard = ({ isLoading, isLoaded, onReload }) => {
    const installedPackages = useAtomValue(installedPackagesAtom);
    const setSelectedPackage = useSetAtom(selectedPackageAtom);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const handleRemoveClick = (pkg) => {
        setSelectedPackage(pkg);
    };

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
            refetch={onReload}
            isFetching={isLoading}
            isLoading={isLoading}
        >
            {isLoaded && (
                <>
                    <InputGroup className={'mb-3'}>
                        <InputGroup.Text>
                            <Icon name={'search'} />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder={'Search installed packages...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

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
                        {pageData.map((pkg, index) => (
                            <tr key={index}>
                                <td>{pkg.name}</td>
                                <td>{pkg.version}</td>
                                <td>{pkg.description}</td>
                                <td>
                                    <Button
                                        variant={'outline-danger'}
                                        size={'sm'}
                                        onClick={() => handleRemoveClick(pkg)}
                                    >
                                        <Icon name={'trash-2'} />
                                    </Button>
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

InstalledPackagesCard.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isLoaded: PropTypes.bool.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default InstalledPackagesCard;
