import Tab from 'react-bootstrap/Tab';

import UsbDevicesCard from '@src/features/hardware/components/UsbDevicesCard';
import FileSystemUsageCard from '@src/features/hardware/components/FileSystemUsageCard';
import SystemLogsCard from '@src/features/hardware/components/SystemLogsCard';
import DiagnosticsCard from '@src/features/hardware/components/DiagnosticsCard';
import PanelTabs from '@src/components/Tabs/PanelTabs';
import TabTitle from '@src/components/Tabs/TabTitle';
import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';

/**
 * Renders the Hardware component which displays various hardware information in tabs.
 *
 * @return {ReactElement} The rendered Hardware component.
 */
const Hardware = () => (
    <PanelTabs id={'hardware'} defaultTab={'info'}>
        <Tab eventKey={'info'} title={<TabTitle title={'Info'} icon={'info'} />}>
            <ConditionalTabContent id={'hardware'} eventKey={'info'}>
                <UsbDevicesCard />
                <FileSystemUsageCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'logs'} title={<TabTitle title={'Logs'} icon={'file-text'} />}>
            <ConditionalTabContent id={'hardware'} eventKey={'logs'}>
                <SystemLogsCard />
            </ConditionalTabContent>
        </Tab>
        <Tab eventKey={'diagnostics'} title={<TabTitle title={'Diagnostics'} icon={'thermometer'} />}>
            <ConditionalTabContent id={'hardware'} eventKey={'diagnostics'}>
                <DiagnosticsCard />
            </ConditionalTabContent>
        </Tab>
    </PanelTabs>
);

export default Hardware;
