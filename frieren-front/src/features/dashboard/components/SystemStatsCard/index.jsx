/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelCard from '@src/components/PanelCard';
import SkeletonBar from '@src/components/SkeletonBar';
import useSystemStats from '@src/features/dashboard/hooks/useSystemStats.js';

const STATS = [
    { key: 'cpu_usage', label: 'cpu usage', width: 60 },
    { key: 'memory_used', label: 'memory', width: 50 },
    { key: 'swap_used', label: 'swap', width: 50 },
    { key: 'uptime', label: 'uptime', width: 80 },
];

/**
 * SystemStatsCard component that displays system stats in a panel card.
 *
 * @return {ReactElement} The panel card component with system stats.
 */
const SystemStatsCard = () => {
    const { data, isSuccess, isLoading, isFetching, refetch } = useSystemStats();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={'d-flex justify-content-evenly mt-2'}>
                    {STATS.map(({ label, width }) => (
                        <div key={label} className={'text-center'}>
                            <p className={'fs-4 mb-0'}>
                                <SkeletonBar width={width} />
                            </p>
                            <span className={'text-muted text-uppercase'}>{label}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (isSuccess) {
            return (
                <div className={'d-flex justify-content-evenly mt-2'}>
                    {STATS.map(({ key, label }) => (
                        <div key={label} className={'text-center'}>
                            <p className={'fs-4 mb-0'}>{data?.[key] ?? ''}</p>
                            <span className={'text-muted text-uppercase'}>{label}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <PanelCard title={'System Stats'} isFetching={isFetching} refetch={refetch}>
            {renderContent()}
        </PanelCard>
    );
};

export default SystemStatsCard;
