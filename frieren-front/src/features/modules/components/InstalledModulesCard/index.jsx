/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import PropTypes from 'prop-types';

import { openLink } from '@src/helpers/actionsHelper.js';
import PanelCard from '@src/components/PanelCard';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import Icon from '@src/components/Icon';
import ModuleIcon from '@src/components/ModuleIcon';
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
                    {modules.map((module, index) => {
                        const { name, title, icon, description, author, version, size, repository, bugs, sidebar, forceSidebar, system } = module;
                        return (
                            <tr key={index}>
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
                                    <Button
                                        variant={'outline-secondary'}
                                        size={'sm'}
                                        onClick={() => openLink(repository)}
                                    >
                                        <Icon name={'external-link'}/>
                                    </Button>
                                    <Button
                                        variant={'outline-secondary'}
                                        size={'sm'}
                                        className={'ms-2'}
                                        onClick={() => openLink(bugs)}
                                    >
                                        <Icon name={'alert-circle'}/>
                                    </Button>
                                    {!system && !forceSidebar && (
                                        <Button
                                            variant={'outline-primary'}
                                            size={'sm'}
                                            className={'ms-2'}
                                            disabled={isPinPending}
                                            onClick={() => handlePinClick(module)}
                                        >
                                            <Icon name={sidebar ? 'eye-off' : 'eye'}/>
                                        </Button>
                                    )}
                                    {!system && (
                                        <Button
                                            variant={'outline-danger'}
                                            size={'sm'}
                                            className={'ms-2'}
                                            onClick={() => handleRemoveClick(module)}
                                        >
                                            <Icon name={'trash-2'}/>
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {modules.length === 0 && (
                        <tr>
                            <td colSpan={6}>There are no modules installed yet.</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            );
        }

        return null;
    };

    return (
        <PanelCard title={'Installed Modules'} isFetching={isFetching} refetch={refetch}>
            {renderContent()}
        </PanelCard>
    );
};

InstalledModulesCard.propTypes = {
    installedQuery: PropTypes.object.isRequired,
};

export default InstalledModulesCard;
