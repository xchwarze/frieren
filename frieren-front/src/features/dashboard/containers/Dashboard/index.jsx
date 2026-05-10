/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
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
        <SystemStatsCard />
        <SystemInfoCard />
        <NewsCard />
    </>
);

export default Dashboard;
