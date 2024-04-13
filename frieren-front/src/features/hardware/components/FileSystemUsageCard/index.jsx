/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useGetFileSystemUsage from '@src/features/hardware/hooks/useGetFileSystemUsage.js';

/**
 * Render a panel card displaying an overview of storage usage across all mounted file systems.
 *
 * @return {ReactElement} The panel card component with filesystem information displayed in a table.
 */
const FileSystemUsageCard = () => {
    const query = useGetFileSystemUsage();
    const { data, isSuccess } = query;

    return (
        <PanelCard
            title={'Resources'}
            subtitle={'Overview of storage usage across all mounted file systems, providing insights into ' +
                'space allocation and utilization.'}
            query={query}
            className={'mt-4'}
        >
            {isSuccess && (
                <Table className={'mt-3'} striped hover responsive>
                    <thead>
                    <tr>
                        <th>Filesystem</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Used</th>
                        <th>Available</th>
                        <th>Used</th>
                        <th>Mounted on</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(({ filesystem, type, size, used, available, usePercent, mountedOn }, index) => (
                        <tr key={index}>
                            <td>{filesystem}</td>
                            <td>{type}</td>
                            <td>{size}</td>
                            <td>{used}</td>
                            <td>{available}</td>
                            <td>{usePercent}</td>
                            <td>{mountedOn}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </PanelCard>
    );
};

export default FileSystemUsageCard;
