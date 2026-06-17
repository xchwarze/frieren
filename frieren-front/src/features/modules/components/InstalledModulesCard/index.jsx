/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import PropTypes from 'prop-types';

import { openLink } from '@src/helpers/actionsHelper.js';
import ActionButtons from '@src/components/ActionButtons';
import Button from '@src/components/Button';
import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import TablePagination from '@src/components/TablePagination';
import ModuleIcon from '@src/components/ModuleIcon';
import usePagination from '@src/hooks/usePagination.js';
import selectedInstalledModuleAtom from '@src/features/modules/atoms/selectedInstalledModuleAtom.js';
import sortModulesByName from '@src/features/modules/helpers/sortModulesByName.js';
import usePinModule from '@src/features/modules/hooks/usePinModule.js';

/**
 * Generates a card displaying information about the installed modules.
 *
 * @param {Object} installedQuery - The query object containing data about installed modules.
 * @return {ReactElement} The panel card component displaying the installed modules.
 */
const InstalledModulesCard = ({ installedQuery }) => {
    const setSelectedInstalledModule = useSetAtom(selectedInstalledModuleAtom);
    const { mutate: pinModuleMutation, isPending: isPinPending } = usePinModule();
    const [, navigate] = useLocation();
    const { data, isSuccess, isLoading, isFetching, refetch } = installedQuery;

    const sortedModules = useMemo(() => sortModulesByName(data ?? []), [data]);

    const { pageData, currentPage, totalPages, setCurrentPage } = usePagination(sortedModules);

    const handleLaunchClick = ({ name }) => {
        navigate(`/${name}`);
    };

    const handlePinClick = ({ title, name, sidebar }) => {
        pinModuleMutation({
            moduleTitle: title,
            moduleName: name,
            status: sidebar ? 'unpin' : 'pin',
        });
    };

    const handleRemoveClick = (module) => {
        setSelectedInstalledModule(module);
    };

    const renderContent = () => {
        if (isLoading) {
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
                    {pageData.map((module) => {
                        const { name, title, icon, description, author, version, size, repository, bugs, sidebar, forceSidebar, system } = module;
                        return (
                            <tr key={name}>
                                <td>
                                    {!system && (
                                        <Button
                                            variant={'dark'}
                                            size={'sm'}
                                            onClick={() => handleLaunchClick(module)}
                                        >
                                            <ModuleIcon name={icon} module={name} /> {title}
                                        </Button>
                                    )}
                                    {system && (
                                        <>
                                            <ModuleIcon name={icon} module={name} /> {title}
                                        </>
                                    )}
                                </td>
                                <td>{description}</td>
                                <td>{author}</td>
                                <td>{version}</td>
                                <td>{size}</td>
                                <td>
                                    <ActionButtons>
                                    <Button
                                        title={'Open repository'}
                                        icon={'external-link'}
                                        variant={'outline-secondary'}
                                        size={'sm'}
                                        onClick={() => openLink(repository)}
                                    />
                                    <Button
                                        title={'Report bug'}
                                        icon={'alert-circle'}
                                        variant={'outline-secondary'}
                                        size={'sm'}
                                        onClick={() => openLink(bugs)}
                                    />
                                    {!system && !forceSidebar && (
                                        <Button
                                            title={sidebar ? 'Unpin' : 'Pin'}
                                            icon={sidebar ? 'eye-off' : 'eye'}
                                            variant={'outline-primary'}
                                            size={'sm'}
                                            disabled={isPinPending}
                                            onClick={() => handlePinClick(module)}
                                        />
                                    )}
                                    {!system && (
                                        <Button
                                            title={'Remove'}
                                            icon={'trash-2'}
                                            variant={'outline-danger'}
                                            size={'sm'}
                                            onClick={() => handleRemoveClick(module)}
                                        />
                                    )}
                                    </ActionButtons>
                                </td>
                            </tr>
                        );
                    })}
                    {sortedModules.length === 0 && (
                        <tr>
                            <td colSpan={6}>There are no modules installed yet.</td>
                        </tr>
                    )}
                    </tbody>
                    </PanelTable>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={sortedModules.length}
                    />
                </>
            );
        }

        return null;
    };

    return (
        <PanelCard title={'Installed Modules'} icon={'layers'} subtitle={'Installed modules'} isFetching={isFetching} refetch={refetch}>
            {renderContent()}
        </PanelCard>
    );
};

InstalledModulesCard.propTypes = {
    installedQuery: PropTypes.object.isRequired,
};

export default InstalledModulesCard;
