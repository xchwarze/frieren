import WirelessManagementCard from '@src/features/wireless/components/WirelessManagementCard';
import WirelessClientCard from '@src/features/wireless/components/WirelessClientCard';

/**
 * Renders the Wireless component which displays WirelessManagementCard and WirelessClientCard components.
 *
 * @return {ReactElement} The rendered Wireless component
 */
const Wireless = () => (
    <>
        <WirelessManagementCard />
        <WirelessClientCard />
    </>
);

export default Wireless;
