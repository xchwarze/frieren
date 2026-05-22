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
        <SystemStatsCard />
        <SystemInfoCard />
        <NewsCard />
    </>
);

export default Dashboard;
