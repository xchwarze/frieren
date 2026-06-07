/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import UpdateAlert from '@src/features/dashboard/components/UpdateAlert';
import SystemStatsCard from '@src/features/dashboard/components/SystemStatsCard';
import SystemInfoCard from '@src/features/dashboard/components/SystemInfoCard';
import NewsCard from '@src/features/dashboard/components/NewsCard';

/**
 * Renders the Dashboard component, displaying system stats, system info, and news.
 *
 * @return {ReactElement} The rendered Dashboard component
 */
const Dashboard = () => (
    <>
        <UpdateAlert />
        <div className={'d-flex flex-column gap-3'}>
            <SystemStatsCard />
            <SystemInfoCard />
            <NewsCard />
        </div>
    </>
);

export default Dashboard;
