/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useEffect, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import { MODULE_INSTALL_TYPE_INTERNAL, MODULE_INSTALL_TYPE_SD } from '@src/features/modules/helpers/constants.js';
import { installModuleAtom, setModuleDestinationAtom } from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';
import useCheckDestination from '@src/features/modules/hooks/useCheckDestination';
import useDownloadModule from '@src/features/modules/hooks/useDownloadModule';
import Button from '@src/components/Button';

/**
 * Generates a modal for installing modules. Handles the download and installation process
 *
 * @return {ReactElement} The modal component for installing modules
 */
const InstallModal = () => {
    const [selectedRemoteModule, setSelectedRemoteModule] = useAtom(installModuleAtom);
    const setDestination = useSetAtom(setModuleDestinationAtom);
    const { data: destinationStatus, refetch: checkDestination, isSuccess: isDestinationSuccess } = useCheckDestination();
    const { mutate: downloadModule } = useDownloadModule();
    const { title, author, repository, destination, updating } = selectedRemoteModule ?? {};
    const { isInternalAvailable, isSDAvailable } = destinationStatus ?? {};
    const isProcessing = destination !== undefined;

    const handleDownloadClick = (destination) => {
        setDestination(destination);
        downloadModule();
    };

    const handleCloseClick = useCallback(() => {
        setSelectedRemoteModule(false);
    }, [setSelectedRemoteModule]);

    useEffect(() => {
        if (selectedRemoteModule) {
            checkDestination();
        }
    }, [selectedRemoteModule, checkDestination]);

    return (
        <Modal show={selectedRemoteModule} onHide={handleCloseClick} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {updating ? `Update Module ${title}` : `Install Module ${title}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isProcessing && (
                    <div className={'text-center mt-3'}>
                        <Spinner animation={'border'}/><p>Downloading and installing...</p>
                    </div>
                )}
                {!isProcessing && (
                    <>
                        <p>This community module was developed by: <b>{author}</b></p>
                        <p>If you have any problem or comment about the module you can leave it to the developer at the
                            &nbsp;<a href={repository} target={'_blank'} rel={'noopener noreferrer'}>following link</a></p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {!isDestinationSuccess && (
                    <Spinner animation={'border'} />
                )}
                {isDestinationSuccess && (
                    <>
                        {isSDAvailable && (
                            <Button
                                label={'Install to SD Card'}
                                icon={'moon'}
                                disabled={destination === MODULE_INSTALL_TYPE_INTERNAL}
                                loading={destination === MODULE_INSTALL_TYPE_SD}
                                onClick={() => handleDownloadClick(MODULE_INSTALL_TYPE_SD)}
                            />
                        )}
                        <Button
                            label={'Install Internally'}
                            icon={'hard-drive'}
                            disabled={!isInternalAvailable || destination === MODULE_INSTALL_TYPE_SD}
                            loading={destination === MODULE_INSTALL_TYPE_INTERNAL}
                            onClick={() => handleDownloadClick(MODULE_INSTALL_TYPE_INTERNAL)}
                        />
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default InstallModal;
