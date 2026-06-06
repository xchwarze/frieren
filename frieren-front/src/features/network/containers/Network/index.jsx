/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Tab from 'react-bootstrap/Tab';

import InterfacesCard from '@src/features/network/components/InterfacesCard';
import DhcpCard from '@src/features/network/components/DhcpCard';
import DiagnosticsCard from '@src/features/network/components/DiagnosticsCard';
import PanelTabs from '@src/components/Tabs/PanelTabs';
import TabTitle from '@src/components/Tabs/TabTitle';
import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';

/**
 * Renders the Network component: interfaces, DHCP leases and diagnostics in tabs.
 *
 * @return {ReactElement} The rendered Network component.
 */
const Network = () => (
    <PanelTabs id={'network'} defaultTab={'interfaces'}>
        <Tab eventKey={'interfaces'} title={<TabTitle title={'Interfaces'} icon={'share-2'} />}>
            <ConditionalTabContent id={'network'} eventKey={'interfaces'}>
                <InterfacesCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'dhcp'} title={<TabTitle title={'DHCP'} icon={'users'} />}>
            <ConditionalTabContent id={'network'} eventKey={'dhcp'}>
                <DhcpCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'diagnostics'} title={<TabTitle title={'Diagnostics'} icon={'activity'} />}>
            <ConditionalTabContent id={'network'} eventKey={'diagnostics'}>
                <DiagnosticsCard />
            </ConditionalTabContent>
        </Tab>
    </PanelTabs>
);

export default Network;
