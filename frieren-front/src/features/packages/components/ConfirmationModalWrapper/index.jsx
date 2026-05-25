/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useAtom } from 'jotai';
import { Modal, Button, Form } from 'react-bootstrap';

import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import useRemovePackage from '@src/features/packages/hooks/useRemovePackage.js';

/**
 * Confirmation modal for package removal with optional autoremove.
 *
 * @return {ReactElement} The confirmation modal component.
 */
const ConfirmationModalWrapper = () => {
    const [selectedPackage, setSelectedPackage] = useAtom(selectedPackageAtom);
    const [autoremove, setAutoremove] = useState(false);
    const { remove } = useRemovePackage();

    const handleClose = () => {
        setSelectedPackage(false);
        setAutoremove(false);
    };

    const handleConfirm = () => {
        remove({ packageName: selectedPackage?.name, autoremove });
        handleClose();
    };

    return (
        <Modal show={!!selectedPackage} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Removal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Are you sure you want to remove the package &quot;{selectedPackage?.name}&quot;?
                    This action cannot be undone.
                </p>
                <Form.Check
                    type={'switch'}
                    id={'autoremove-switch'}
                    label={'Also remove unused dependencies'}
                    checked={autoremove}
                    onChange={(e) => setAutoremove(e.target.checked)}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant={'secondary'} onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant={'danger'} onClick={handleConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModalWrapper;
