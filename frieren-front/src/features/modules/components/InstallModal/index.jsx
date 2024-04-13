/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { Modal, Button, Spinner } from 'react-bootstrap';

import selectedRemoteModuleAtom from '@src/features/modules/atoms/selectedRemoteModuleAtom.js';
import useCheckDestination from '@src/features/modules/hooks/useCheckDestination';
import useDownloadModule from '@src/features/modules/hooks/useDownloadModule';
import useInstallModule from '@src/features/modules/hooks/useInstallModule';
import useDownloadStatus from '@src/features/modules/hooks/useDownloadStatus';
import useInstallationStatus from '@src/features/modules/hooks/useInstallationStatus';

/**
 * Generates a modal for installing modules. Handles the download and installation process
 *
 * @return {ReactElement} The modal component for installing modules
 */
const InstallModal = () => {
    const STATUS_DOWNLOADING = 'downloading';
    const STATUS_INSTALLING = 'installing';

    const [destination, setDestination] = useState('');
    const [status, setStatus] = useState('');
    const [selectedRemoteModule, setSelectedRemoteModule] = useAtom(selectedRemoteModuleAtom);

    const { mutate: checkDestination } = useCheckDestination();
    const { mutate: downloadModule } = useDownloadModule();
    const { mutate: installModule } = useInstallModule();
    const isDownloadComplete  = useDownloadStatus({
        isActive: status === STATUS_DOWNLOADING,
        moduleName: selectedRemoteModule?.title,
        destination
    });
    const isInstallationComplete = useInstallationStatus({
        isActive: status === STATUS_INSTALLING,
        moduleName: selectedRemoteModule?.title
    });

    const handleDownloadClick = (dest) => {
        setDestination(dest);
        downloadModule({
            moduleName: selectedRemoteModule.title,
            destination: dest
        });
        setStatus(STATUS_DOWNLOADING);
    };

    const handleCloseClick = useCallback(() => {
        setSelectedRemoteModule(false);
        setStatus('');
    }, [setSelectedRemoteModule]);

    useEffect(() => {
        if (selectedRemoteModule) {
            // TODO esto esta por la mitad
            checkDestination({
                moduleName: selectedRemoteModule.title,
                moduleSize: selectedRemoteModule.size
            });
        }
    }, [selectedRemoteModule, checkDestination]);

    useEffect(() => {
        if (isDownloadComplete) {
            installModule({
                moduleName: selectedRemoteModule.title,
                destination
            });
            setStatus(STATUS_INSTALLING);
        }
    }, [destination, installModule, isDownloadComplete, selectedRemoteModule.title]);

    useEffect(() => {
        if (isInstallationComplete) {
            handleCloseClick();
        }
    }, [handleCloseClick, isInstallationComplete]);

    return (
        <Modal show={selectedRemoteModule} onHide={handleCloseClick} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {selectedRemoteModule?.updating ? `Update Module ${selectedRemoteModule.title}` : `Install Module ${selectedRemoteModule.title}`}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {status === STATUS_DOWNLOADING && <div className="text-center"><Spinner animation="border" /><p>Downloading...</p></div>}
                {status === STATUS_INSTALLING && <div className="text-center"><Spinner animation="border" /><p>Installing...</p></div>}
                {status === '' && (
                    <>
                        <p>This community module was developed by: <b>{selectedRemoteModule.author}</b></p>
                        <p>If you have any problem or comment about the module you can leave it to the developer at the <a href="" target="_blank" rel="noopener noreferrer">following link</a></p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => handleDownloadClick('sd')} disabled={status !== ''}>Install to SD Card</Button>
                <Button onClick={() => handleDownloadClick('internal')} disabled={status !== ''} className="ms-2">Install Internally</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InstallModal;
