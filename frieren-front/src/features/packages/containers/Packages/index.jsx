/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useEffect, useCallback } from 'react';
import { useSetAtom } from 'jotai';

import useInstalledPackages from '@src/features/packages/hooks/useInstalledPackages.js';
import useGetInstalledPackagesStatus from '@src/features/packages/hooks/useGetInstalledPackagesStatus.js';
import useAvailablePackages from '@src/features/packages/hooks/useAvailablePackages.js';
import useGetAvailablePackagesStatus from '@src/features/packages/hooks/useGetAvailablePackagesStatus.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';
import AvailablePackagesCard from '@src/features/packages/components/AvailablePackagesCard';
import InstalledPackagesCard from '@src/features/packages/components/InstalledPackagesCard';
import ConfirmationModalWrapper from '@src/features/packages/components/ConfirmationModalWrapper';

/**
 * Main packages container. Orchestrates async loading of installed and available package lists.
 *
 * @return {ReactElement} The Packages component.
 */
const Packages = () => {
    const [isLoadingInstalled, setIsLoadingInstalled] = useState(false);
    const [installedLoaded, setInstalledLoaded] = useState(false);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [availableLoaded, setAvailableLoaded] = useState(false);

    const setInstalledPackages = useSetAtom(installedPackagesAtom);
    const setAvailablePackages = useSetAtom(availablePackagesAtom);

    const { mutate: fetchInstalled } = useInstalledPackages();
    const installedStatus = useGetInstalledPackagesStatus({ enabled: isLoadingInstalled });

    const { mutate: fetchAvailable } = useAvailablePackages();
    const availableStatus = useGetAvailablePackagesStatus({ enabled: isLoadingAvailable });

    const loadInstalled = useCallback(() => {
        setInstalledLoaded(false);
        fetchInstalled(undefined, {
            onSuccess: () => setIsLoadingInstalled(true),
        });
    }, [fetchInstalled]);

    const loadAvailable = useCallback(() => {
        setAvailableLoaded(false);
        fetchAvailable(undefined, {
            onSuccess: () => setIsLoadingAvailable(true),
        });
    }, [fetchAvailable]);

    const reloadBothLists = useCallback(() => {
        loadInstalled();
        if (availableLoaded) {
            loadAvailable();
        }
    }, [loadInstalled, loadAvailable, availableLoaded]);

    useEffect(() => {
        loadInstalled();
    }, [loadInstalled]);

    useEffect(() => {
        if (isLoadingInstalled && installedStatus.data?.completed) {
            setInstalledPackages(installedStatus.data.packages || []);
            setIsLoadingInstalled(false);
            setInstalledLoaded(true);
        }
    }, [isLoadingInstalled, installedStatus.data, setInstalledPackages]);

    useEffect(() => {
        if (isLoadingAvailable && availableStatus.data?.completed) {
            setAvailablePackages(availableStatus.data.packages || []);
            setIsLoadingAvailable(false);
            setAvailableLoaded(true);
        }
    }, [isLoadingAvailable, availableStatus.data, setAvailablePackages]);

    return (
        <>
            <AvailablePackagesCard
                isLoading={isLoadingAvailable}
                isLoaded={availableLoaded}
                onLoadAvailable={loadAvailable}
                onReloadInstalled={reloadBothLists}
            />
            <InstalledPackagesCard
                isLoading={isLoadingInstalled}
                isLoaded={installedLoaded}
                onReload={loadInstalled}
            />
            <ConfirmationModalWrapper onReloadInstalled={reloadBothLists} />
        </>
    );
};

export default Packages;
