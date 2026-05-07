/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

import ConfirmationModal from '@src/components/ConfirmationModal';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import useRemovePackage from '@src/features/packages/hooks/useRemovePackage.js';
import useGetRemoveStatus from '@src/features/packages/hooks/useGetRemoveStatus.js';

/**
 * Confirmation modal for package removal with async polling.
 *
 * @param {Function} onReloadInstalled - Callback to reload installed packages after removal.
 * @return {ReactElement} The confirmation modal component.
 */
const ConfirmationModalWrapper = ({ onReloadInstalled }) => {
    const [selectedPackage, setSelectedPackage] = useAtom(selectedPackageAtom);
    const [isRemoving, setIsRemoving] = useState(false);
    const [removingName, setRemovingName] = useState('');
    const { mutate: removePackage } = useRemovePackage();

    const removeStatusQuery = useGetRemoveStatus({ enabled: isRemoving });

    useEffect(() => {
        if (isRemoving && removeStatusQuery.data?.completed) {
            setIsRemoving(false);
            toast.success(`Package ${removingName} successfully removed`);
            setRemovingName('');
            setTimeout(() => onReloadInstalled(), 500);
        }
    }, [isRemoving, removeStatusQuery.data, removingName, onReloadInstalled]);

    const handleClose = () => {
        setSelectedPackage(false);
    };

    const handleConfirm = () => {
        setRemovingName(selectedPackage?.name);
        removePackage({ packageName: selectedPackage?.name }, {
            onSuccess: () => setIsRemoving(true),
        });
        handleClose();
    };

    return (
        <ConfirmationModal
            show={selectedPackage}
            onHide={handleClose}
            onConfirm={handleConfirm}
            title={'Confirm Removal'}
            description={`Are you sure you want to remove the package "${selectedPackage?.name}"? This action cannot be undone.`}
            isConfirmLoading={isRemoving}
        />
    );
};

ConfirmationModalWrapper.propTypes = {
    onReloadInstalled: PropTypes.func.isRequired,
};

export default ConfirmationModalWrapper;
