/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';
import { useSetAtom } from 'jotai';
import PropTypes from 'prop-types';

import { openLink } from '@src/helpers/actionsHelper.js';
import PanelCard from '@src/components/PanelCard';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import Button from '@src/components/Button';
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
    const { data: installedModules } = installedQuery;

    const checkInstalled = (newModule) => (
        installedModules.some((module) => module.name === newModule.name)
    );

    const checkUpdateable = (newModule) => (
        checkInstalled(newModule) && installedModules.some((module) => module.version !== newModule.version)
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
            const modules = sortModulesByName(data);

            return (
                <Table striped hover responsive>
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
                    {modules.map((module, index) => (
                        <tr key={index}>
                            <td>{module.title}</td>
                            <td>{module.description}</td>
                            <td>{module.author}</td>
                            <td>{module.version}</td>
                            <td>{module.sizeHuman}</td>
                            <td>
                                <Button
                                    label={''}
                                    icon={'external-link'}
                                    variant={'outline-secondary'}
                                    size={'sm'}
                                    onClick={() => openLink(module.repository)}
                                />
                                {!checkInstalled(module) && (
                                    <Button
                                        label={''}
                                        icon={'download-cloud'}
                                        variant={'outline-primary'}
                                        size={'sm'}
                                        className={'ms-2'}
                                        onClick={() => handleDownloadClick(module)}
                                    />
                                )}
                                {checkUpdateable(module) && (
                                    <Button
                                        label={''}
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
                    </tbody>
                </Table>
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
