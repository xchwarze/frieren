/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import useSystemResume from '@src/features/dashboard/hooks/useSystemResume.js';

/**
 * Generate a System Information card displaying hostname, model, architecture, target platform, firmware version, and kernel version.
 *
 * @return {ReactElement} The System Information card component
 */
const SystemInfoCard = () => {
    const { data, isSuccess, isLoading } = useSystemResume();

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonTable widths={[120, 180]} rows={6} />;
        }

        if (isSuccess) {
            return (
                <PanelTable>
                    <tbody>
                    <tr>
                        <td>Hostname</td>
                        <td>{data.hostname}</td>
                    </tr>
                    <tr>
                        <td>Model</td>
                        <td>{data.model}</td>
                    </tr>
                    <tr>
                        <td>Architecture</td>
                        <td>{data.system}</td>
                    </tr>
                    <tr>
                        <td>Target Platform</td>
                        <td>{data.release.target}</td>
                    </tr>
                    <tr>
                        <td>Firmware Version</td>
                        <td>{`${data.release.distribution} ${data.release.version} ${data.release.revision}`}</td>
                    </tr>
                    <tr>
                        <td>Kernel Version</td>
                        <td>{data.kernel}</td>
                    </tr>
                    </tbody>
                </PanelTable>
            );
        }

        return null;
    };

    return (
        <PanelCard title={'System Information'} showRefresh={false}>
            {renderContent()}
        </PanelCard>
    );
};

export default SystemInfoCard;
