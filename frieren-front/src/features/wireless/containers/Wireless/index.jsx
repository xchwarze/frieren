/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelTabs, { renderPanelTab } from '@src/components/Tabs/PanelTabs';
import PanelStack from '@src/components/PanelCard/PanelStack';
import WirelessOverviewCard from '@src/features/wireless/components/WirelessOverviewCard';
import AssociationListCard from '@src/features/wireless/components/AssociationListCard';
import WirelessAdvancedCard from '@src/features/wireless/components/WirelessAdvancedCard';

const TABS = [
    {
        key: 'overview',
        title: 'Overview',
        icon: 'wifi',
        content: (
            <PanelStack>
                <WirelessOverviewCard />
                <AssociationListCard />
            </PanelStack>
        ),
    },
    { key: 'advanced', title: 'Advanced Config', icon: 'sliders', content: <WirelessAdvancedCard /> },
];

/**
 * Renders the Wireless feature with Overview and Advanced Config tabs.
 *
 * @return {ReactElement} The Wireless component.
 */
const Wireless = () => (
    <PanelTabs id={'wireless'} defaultTab={'overview'}>
        {TABS.map((tab) => renderPanelTab('wireless', tab))}
    </PanelTabs>
);

export default Wireless;
