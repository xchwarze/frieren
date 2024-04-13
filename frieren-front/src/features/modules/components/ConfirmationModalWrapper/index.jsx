/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtom } from 'jotai';

import ConfirmationModal from '@src/components/ConfirmationModal';
import selectedInstalledModuleAtom from '@src/features/modules/atoms/selectedInstalledModuleAtom.js';
import useRemoveModule from '@src/features/modules/hooks/useRemoveModule';

/**
 * Generates a confirmation modal wrapper with handlers for closing and confirming deletion.
 *
 * @return {ReactElement} The JSX element of the confirmation modal.
 */
const ConfirmationModalWrapper = () => {
    const [selectedInstalledModule, setSelectedInstalledModule] = useAtom(selectedInstalledModuleAtom);
    const { mutate: removeModule, isLoading: isRemovingModule } = useRemoveModule();

    const handleClose = () => {
        setSelectedInstalledModule(false);
    };

    const handleConfirm = () => {
        removeModule({
            moduleName: selectedInstalledModule?.name
        });
        handleClose();
    };

    return (
        <ConfirmationModal
            show={selectedInstalledModule}
            onHide={handleClose}
            onConfirm={handleConfirm}
            title={'Confirm Deletion'}
            description={`Are you sure you want to remove the module "${selectedInstalledModule?.title}"? This action cannot be undone.`}
            isConfirmLoading={isRemovingModule}
        />
    );
};

export default ConfirmationModalWrapper;
