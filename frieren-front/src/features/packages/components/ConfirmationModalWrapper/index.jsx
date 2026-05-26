/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState } from 'react';
import { useAtom } from 'jotai';
import Form from 'react-bootstrap/Form';

import ConfirmationModal from '@src/components/ConfirmationModal';
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
        <ConfirmationModal
            show={!!selectedPackage}
            onHide={handleClose}
            onConfirm={handleConfirm}
            title={'Confirm Removal'}
            description={<>Are you sure you want to remove the package <strong>{selectedPackage?.name}</strong>?<br />This action cannot be undone.</>}
        >
            <Form.Check
                type={'switch'}
                id={'autoremove-switch'}
                label={'Also remove unused dependencies'}
                checked={autoremove}
                onChange={(e) => setAutoremove(e.target.checked)}
                className={'mt-3'}
            />
        </ConfirmationModal>
    );
};

export default ConfirmationModalWrapper;
