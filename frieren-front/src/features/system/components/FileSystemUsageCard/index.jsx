/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import useGetFileSystemUsage from '@src/features/system/hooks/useGetFileSystemUsage.js';

/**
 * Render a panel card displaying an overview of storage usage across all mounted file systems.
 *
 * @return {ReactElement} The panel card component with filesystem information displayed in a table.
 */
const FileSystemUsageCard = () => {
    const { data, isSuccess, isLoading, isFetching, refetch } = useGetFileSystemUsage();

    const renderContent = () => {
        if (isLoading) {
            return (
                <SkeletonTable
                    headers={['Filesystem', 'Type', 'Size', 'Used', 'Available', 'Use%', 'Mounted on']}
                    widths={[100, 50, 50, 50, 60, 40, 80]}
                />
            );
        }

        if (isSuccess) {
            return (
                <PanelTable>
                    <thead>
                    <tr>
                        <th>Filesystem</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Used</th>
                        <th>Available</th>
                        <th>Use%</th>
                        <th>Mounted on</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={7}>No file systems found.</td>
                        </tr>
                    )}
                    {data.map(({ filesystem, type, size, used, available, usePercent, mountedOn }) => (
                        <tr key={filesystem}>
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
                </PanelTable>
            );
        }

        return null;
    };

    return (
        <PanelCard
            title={'Resources'}
            subtitle={'Overview of storage usage across all mounted file systems, providing insights into ' +
                'space allocation and utilization.'}
            isFetching={isFetching}
            refetch={refetch}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default FileSystemUsageCard;
