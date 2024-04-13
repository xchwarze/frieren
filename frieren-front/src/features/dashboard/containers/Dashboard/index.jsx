/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import SystemStatsCard from '@src/features/dashboard/components/SystemStatsCard';
import SystemInfoCard from '@src/features/dashboard/components/SystemInfoCard';

/**
 * Renders the Dashboard component, displaying the SystemStatsCard and SystemInfoCard components.
 *
 * @return {ReactElement} The rendered Dashboard component
 */
const Dashboard = () => (
    <>
        <SystemStatsCard />
        <SystemInfoCard />
    </>
);

export default Dashboard;
