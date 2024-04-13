import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useSetAtom } from 'jotai';
import { useLocation } from 'wouter';
import PropTypes from 'prop-types';

import { openLink } from '@src/helpers/actionsHelper.js';
import PanelCard from '@src/components/PanelCard';
import Icon from '@src/components/Icon';
import ModuleIcon from '@src/components/ModuleIcon';
import selectedInstalledModuleAtom from '@src/features/modules/atoms/selectedInstalledModuleAtom.js';
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
    const { data, isSuccess } = installedQuery;

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

    return (
        <PanelCard
            title={'Installed Modules'}
            query={installedQuery}
        >
            {isSuccess && (
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
                    {data.map((module, index) => {
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
                    </tbody>
                </Table>
            )}
        </PanelCard>
    );
};

InstalledModulesCard.propTypes = {
    installedQuery: PropTypes.object.isRequired,
};

export default InstalledModulesCard;
