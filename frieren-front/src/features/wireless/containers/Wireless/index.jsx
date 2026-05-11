/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Tab from 'react-bootstrap/Tab';

import PanelTabs from '@src/components/Tabs/PanelTabs';
import TabTitle from '@src/components/Tabs/TabTitle';
import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';
import WirelessOverviewCard from '@src/features/wireless/components/WirelessOverviewCard';
import AssociationListCard from '@src/features/wireless/components/AssociationListCard';
import WirelessAdvancedCard from '@src/features/wireless/components/WirelessAdvancedCard';

/**
 * Renders the Wireless feature with Overview and Advanced Config tabs.
 *
 * @return {ReactElement} The Wireless component.
 */
const Wireless = () => (
    <PanelTabs id={'wireless'} defaultTab={'overview'}>
        <Tab eventKey={'overview'} title={<TabTitle title={'Overview'} icon={'wifi'} />}>
            <ConditionalTabContent id={'wireless'} eventKey={'overview'}>
                <WirelessOverviewCard />
                <AssociationListCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'advanced'} title={<TabTitle title={'Advanced Config'} icon={'sliders'} />}>
            <ConditionalTabContent id={'wireless'} eventKey={'advanced'}>
                <WirelessAdvancedCard />
            </ConditionalTabContent>
        </Tab>
    </PanelTabs>
);

export default Wireless;
