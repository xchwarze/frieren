/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Tab from 'react-bootstrap/Tab';

import UsbDevicesCard from '@src/features/system/components/UsbDevicesCard';
import FileSystemUsageCard from '@src/features/system/components/FileSystemUsageCard';
import SystemLogsCard from '@src/features/system/components/SystemLogsCard';
import DiagnosticsCard from '@src/features/system/components/DiagnosticsCard';
import ServicesCard from '@src/features/system/components/ServicesCard';
import PanelTabs from '@src/components/Tabs/PanelTabs';
import TabTitle from '@src/components/Tabs/TabTitle';
import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';

/**
 * Renders the System component: device info, logs, diagnostics and service control in tabs.
 *
 * @return {ReactElement} The rendered System component.
 */
const System = () => (
    <PanelTabs id={'system'} defaultTab={'info'}>
        <Tab eventKey={'info'} title={<TabTitle title={'Info'} icon={'info'} />}>
            <ConditionalTabContent id={'system'} eventKey={'info'}>
                <UsbDevicesCard />
                <FileSystemUsageCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'services'} title={<TabTitle title={'Services'} icon={'server'} />}>
            <ConditionalTabContent id={'system'} eventKey={'services'}>
                <ServicesCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'logs'} title={<TabTitle title={'Logs'} icon={'file-text'} />}>
            <ConditionalTabContent id={'system'} eventKey={'logs'}>
                <SystemLogsCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'diagnostics'} title={<TabTitle title={'Diagnostics'} icon={'thermometer'} />}>
            <ConditionalTabContent id={'system'} eventKey={'diagnostics'}>
                <DiagnosticsCard />
            </ConditionalTabContent>
        </Tab>
    </PanelTabs>
);

export default System;
