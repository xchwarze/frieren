/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import PropTypes from 'prop-types';

import { openLink } from '@src/helpers/actionsHelper.js';
import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import TablePagination from '@src/components/TablePagination';
import SearchInput from '@src/components/SearchInput';
import Button from '@src/components/Button';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';
import usePagination from '@src/hooks/usePagination.js';
import { installModuleAtom } from '@src/features/modules/atoms/installModuleAtom.js';
import sortModulesByName from '@src/features/modules/helpers/sortModulesByName.js';

/**
 * Generates a card component displaying available modules. Handles click events for downloading modules.
 *
 * @param {Object} availableQuery - The query object for available modules.
 * @param {Object} installedQuery - The query object for installed modules.
 * @return {ReactElement} The AvailableModulesCard component.
 */
const AvailableModulesCard = ({ availableQuery, installedQuery }) => {
    const setSelectedRemoteModule = useSetAtom(installModuleAtom);
    const { data, isSuccess, isFetching, refetch } = availableQuery;
    const { data: installedModules = [] } = installedQuery;
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const filteredModules = useMemo(() => {
        const modules = sortModulesByName(data ?? []);
        if (!debouncedSearch) {
            return modules;
        }
        const term = debouncedSearch.toLowerCase();
        return modules.filter((module) =>
            module.title.toLowerCase().includes(term) ||
            (module.description ?? '').toLowerCase().includes(term)
        );
    }, [data, debouncedSearch]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(filteredModules);

    const checkInstalled = (newModule) => (
        installedModules.some((module) => module.name === newModule.name)
    );

    const checkUpdateable = (newModule) => (
        installedModules.some((module) => module.name === newModule.name && module.version !== newModule.version)
    );

    const handleDownloadClick = (value) => {
        setSelectedRemoteModule(value);
    };

    const renderContent = () => {
        if (isFetching && !isSuccess) {
            return (
                <SkeletonTable
                    headers={['Module', 'Description', 'Author', 'Version', 'Size', 'Action']}
                    widths={[100, 160, 80, 60, 50, 90]}
                />
            );
        }

        if (isSuccess) {
            return (
                <>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={'Search available modules...'}
                    />

                    <PanelTable>
                    <thead>
                    <tr>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Author</th>
                        <th>Version</th>
                        <th>Size</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pageData.map((module) => (
                        <tr key={module.name}>
                            <td>{module.title}</td>
                            <td>{module.description}</td>
                            <td>{module.author}</td>
                            <td>{module.version}</td>
                            <td>{module.sizeHuman}</td>
                            <td>
                                <Button
                                    aria-label={'Open repository'}
                                    icon={'external-link'}
                                    variant={'outline-secondary'}
                                    size={'sm'}
                                    onClick={() => openLink(module.repository)}
                                />
                                {!checkInstalled(module) && (
                                    <Button
                                        aria-label={'Download module'}
                                        icon={'download-cloud'}
                                        variant={'outline-primary'}
                                        size={'sm'}
                                        className={'ms-2'}
                                        onClick={() => handleDownloadClick(module)}
                                    />
                                )}
                                {checkUpdateable(module) && (
                                    <Button
                                        aria-label={'Update module'}
                                        icon={'download-cloud'}
                                        variant={'outline-warning'}
                                        size={'sm'}
                                        className={'ms-2'}
                                        onClick={() => handleDownloadClick(module)}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredModules.length === 0 && (
                        <tr>
                            <td colSpan={6}>No modules found.</td>
                        </tr>
                    )}
                    </tbody>
                    </PanelTable>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredModules.length}
                    />
                </>
            );
        }

        return (
            <div className={'text-center'}>
                <Button
                    label={'Get Modules'}
                    icon={'cloud'}
                    onClick={refetch}
                />
            </div>
        );
    };

    return (
        <PanelCard
            title={'Available Modules'}
            subtitle={'Expand the possibilities of your Frieren installation through our module community.'}
            showRefresh={isSuccess}
            isFetching={isFetching}
            refetch={refetch}
        >
            {renderContent()}
        </PanelCard>
    );
};

AvailableModulesCard.propTypes = {
    availableQuery: PropTypes.object.isRequired,
    installedQuery: PropTypes.object.isRequired,
};

export default AvailableModulesCard;
