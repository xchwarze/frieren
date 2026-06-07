/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import InterfacesCard from '@src/features/network/components/InterfacesCard';
import DhcpCard from '@src/features/network/components/DhcpCard';
import DiagnosticsCard from '@src/features/network/components/DiagnosticsCard';
import PanelTabs, { renderPanelTab } from '@src/components/Tabs/PanelTabs';

const TABS = [
    { key: 'interfaces', title: 'Interfaces', icon: 'share-2', content: <InterfacesCard /> },
    { key: 'dhcp', title: 'DHCP', icon: 'users', content: <DhcpCard /> },
    { key: 'diagnostics', title: 'Diagnostics', icon: 'activity', content: <DiagnosticsCard /> },
];

/**
 * Renders the Network component: interfaces, DHCP leases and diagnostics in tabs.
 *
 * @return {ReactElement} The rendered Network component.
 */
const Network = () => (
    <PanelTabs id={'network'} defaultTab={'interfaces'}>
        {TABS.map((tab) => renderPanelTab('network', tab))}
    </PanelTabs>
);

export default Network;
