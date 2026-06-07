/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import useGetUsbDevices from '@src/features/system/hooks/useGetUsbDevices.js';

/**
 * Renders a card displaying detailed information about connected USB devices.
 *
 * @return {ReactElement} The panel card component with USB devices information.
 */
const UsbDevicesCard = () => {
    const { data, isSuccess, isLoading, isFetching, refetch } = useGetUsbDevices();

    const renderContent = () => {
        if (isLoading) {
            return (
                <SkeletonTable
                    headers={['Bus', 'Device', 'ID', 'Name']}
                    widths={[40, 50, 80, 200]}
                />
            );
        }

        if (isSuccess) {
            return (
                <Table striped hover responsive>
                    <thead>
                    <tr>
                        <th>Bus</th>
                        <th>Device</th>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={4}>No USB devices detected.</td>
                        </tr>
                    )}
                    {data.map(({ id, name, device, bus }) => (
                        <tr key={`${bus}-${device}`}>
                            <td>{bus}</td>
                            <td>{device}</td>
                            <td>{id}</td>
                            <td>{name}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            );
        }

        return null;
    };

    return (
        <PanelCard
            title={'USB Devices'}
            subtitle={'Detailed tracking of connected USB devices, facilitating device identification ' +
                'and resolving USB-related issues'}
            isFetching={isFetching}
            refetch={refetch}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default UsbDevicesCard;
