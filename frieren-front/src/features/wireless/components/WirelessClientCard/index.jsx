/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';

import useGetWirelessInterfaces from '@src/features/wireless/hooks/useGetWirelessInterfaces.js';
import useGetClientConfig from '@src/features/wireless/hooks/useGetClientConfig.js';
import ClientInfoForm from '@src/features/wireless/components/ClientInfoForm';
import ClientConfigForm from '@src/features/wireless/components/ClientConfigForm';
import PanelCard from '@src/components/PanelCard';

/**
 * Generates a WirelessClientCard component that displays either a ClientInfoForm or a ClientConfigForm based on the client configuration.
 *
 * @return {ReactElement} The WirelessClientCard component
 */
const WirelessClientCard = () => {
    const { data: wirelessInterfaces, refetch: refetchWirelessInterfaces, isFetching: isFetchingWirelessInterfaces } = useGetWirelessInterfaces();
    const { data: clientConfig, refetch: refetchClientConfig, isFetching: isFetchingClientConfig } = useGetClientConfig();

    const refetchAll = useCallback(() => {
        refetchWirelessInterfaces();
        refetchClientConfig();
    }, [refetchClientConfig, refetchWirelessInterfaces]);

    return (
        <PanelCard
            title={'Wireless Client Interface'}
            isFetching={isFetchingWirelessInterfaces && isFetchingClientConfig}
            refetch={refetchAll}
        >
            {clientConfig?.connected ? (
                <ClientInfoForm clientConfig={clientConfig} />
            ) : (
                <ClientConfigForm wirelessInterfaces={wirelessInterfaces} />
            )}
        </PanelCard>
    );
};

export default WirelessClientCard;
