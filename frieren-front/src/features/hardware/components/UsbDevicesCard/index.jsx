import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useGetUsbDevices from '@src/features/hardware/hooks/useGetUsbDevices.js';

/**
 * Renders a card displaying detailed information about connected USB devices.
 *
 * @return {ReactElement} The panel card component with USB devices information.
 */
const UsbDevicesCard = () => {
    const query = useGetUsbDevices();
    const { data, isSuccess } = query;

    return (
        <PanelCard
            title={'USB Devices'}
            subtitle={'Detailed tracking of connected USB devices, facilitating device identification ' +
                'and resolving USB-related issues'}
            query={query}
        >
            {isSuccess && (
                <Table className={'mt-4'} striped hover responsive>
                    <thead>
                    <tr>
                        <th>Bus</th>
                        <th>Device</th>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(({ id, name, device, bus }, index) => (
                        <tr key={index}>
                            <td>{bus}</td>
                            <td>{device}</td>
                            <td>{id}</td>
                            <td>{name}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </PanelCard>
    );
};

export default UsbDevicesCard;
