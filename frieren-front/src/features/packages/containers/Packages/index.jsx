/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import AvailablePackagesCard from '@src/features/packages/components/AvailablePackagesCard';
import InstalledPackagesCard from '@src/features/packages/components/InstalledPackagesCard';
import ConfirmationModalWrapper from '@src/features/packages/components/ConfirmationModalWrapper';

/**
 * Main packages container.
 *
 * @return {ReactElement} The Packages component.
 */
const Packages = () => (
    <>
        <AvailablePackagesCard />
        <InstalledPackagesCard />
        <ConfirmationModalWrapper />
    </>
);

export default Packages;
