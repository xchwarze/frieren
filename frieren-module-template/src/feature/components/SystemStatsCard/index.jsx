/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelCard from '@common/components/PanelCard';
import useSystemStats from '@module/feature/hooks/useSystemStats.js';

/**
 * SystemStatsCard component that displays system stats in a panel card.
 *
 * @return {ReactElement} The panel card component with system stats.
 */
const SystemStatsCard = () => {
    const query = useSystemStats();
    const { data, isSuccess, isFetching } = query;

    return (
        <PanelCard
            title={'System Stats'}
            icon={'cpu'}
            refetch={query.refetch}
            isFetching={query.isFetching}
        >
            {isSuccess && !isFetching && (
                <div className={'d-flex justify-content-evenly'}>
                    <div className={'text-center'}>
                        <p className={'fs-4 mb-0'}>
                            {data?.cpu_usage ?? ''}
                        </p>
                        <span className={'text-body-secondary text-uppercase'}>
                            cpu usage
                        </span>
                    </div>
                    <div className={'text-center'}>
                        <p className={'fs-4 mb-0'}>
                            {data?.memory_used ?? ''}
                        </p>
                        <span className={'text-body-secondary text-uppercase'}>
                            memory
                        </span>
                    </div>
                    <div className={'text-center'}>
                        <p className={'fs-4 mb-0'}>
                            {data?.swap_used ?? ''}
                        </p>
                        <span className={'text-body-secondary text-uppercase'}>
                            swap
                        </span>
                    </div>
                    <div className={'text-center me-3'}>
                        <p className={'fs-4 mb-0'}>
                            {data?.uptime ?? ''}
                        </p>
                        <span className={'text-body-secondary text-uppercase'}>
                            uptime
                        </span>
                    </div>
                </div>
            )}
        </PanelCard>
    );
};

export default SystemStatsCard;
