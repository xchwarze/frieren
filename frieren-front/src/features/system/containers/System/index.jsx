/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import UsbDevicesCard from '@src/features/system/components/UsbDevicesCard';
import FileSystemUsageCard from '@src/features/system/components/FileSystemUsageCard';
import SystemLogsCard from '@src/features/system/components/SystemLogsCard';
import DiagnosticsCard from '@src/features/system/components/DiagnosticsCard';
import ServicesCard from '@src/features/system/components/ServicesCard';
import PanelTabs, { renderPanelTab } from '@src/components/Tabs/PanelTabs';

const TABS = [
    {
        key: 'info',
        title: 'Info',
        icon: 'info',
        content: (
            <div className={'d-flex flex-column gap-4'}>
                <UsbDevicesCard />
                <FileSystemUsageCard />
                <DiagnosticsCard />
            </div>
        ),
    },
    { key: 'services', title: 'Services', icon: 'server', content: <ServicesCard /> },
    { key: 'logs', title: 'Logs', icon: 'file-text', content: <SystemLogsCard /> },
];

/**
 * Renders the System component: device info, logs, diagnostics and service control in tabs.
 *
 * @return {ReactElement} The rendered System component.
 */
const System = () => (
    <PanelTabs id={'system'} defaultTab={'info'}>
        {TABS.map((tab) => renderPanelTab('system', tab))}
    </PanelTabs>
);

export default System;
