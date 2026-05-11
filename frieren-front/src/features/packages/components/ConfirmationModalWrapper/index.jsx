/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtom } from 'jotai';

import ConfirmationModal from '@src/components/ConfirmationModal';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import useRemovePackage from '@src/features/packages/hooks/useRemovePackage.js';

/**
 * Confirmation modal for package removal with async polling.
 *
 * @return {ReactElement} The confirmation modal component.
 */
const ConfirmationModalWrapper = () => {
    const [selectedPackage, setSelectedPackage] = useAtom(selectedPackageAtom);
    const { remove } = useRemovePackage();

    const handleClose = () => {
        setSelectedPackage(false);
    };

    const handleConfirm = () => {
        remove({ packageName: selectedPackage?.name });
        handleClose();
    };

    return (
        <ConfirmationModal
            show={selectedPackage}
            onHide={handleClose}
            onConfirm={handleConfirm}
            title={'Confirm Removal'}
            description={`Are you sure you want to remove the package "${selectedPackage?.name}"? This action cannot be undone.`}
        />
    );
};

export default ConfirmationModalWrapper;
