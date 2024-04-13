/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAvailableModules from '@src/features/modules/hooks/useAvailableModules.js';
import useInstalledModules from "@src/features/modules/hooks/useInstalledModules.js";
import AvailableModulesCard from '@src/features/modules/components/AvailableModulesCard';
import InstalledModulesCard from '@src/features/modules/components/InstalledModulesCard';
import InstallModal from '@src/features/modules/components/InstallModal';
import ConfirmationModalWrapper from '@src/features/modules/components/ConfirmationModalWrapper';

/**
 * Creates and returns the Modules component, which renders various module related cards and modals.
 *
 * @return {ReactElement} The Modules component
 */
const Modules = () => {
    const availableQuery = useAvailableModules({ enabled: false });
    const installedQuery = useInstalledModules();

    return (
        <>
            <AvailableModulesCard availableQuery={availableQuery} installedQuery={installedQuery} />
            <InstalledModulesCard installedQuery={installedQuery} />
            <InstallModal />
            <ConfirmationModalWrapper />
        </>
    );
};

export default Modules;
