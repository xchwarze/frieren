/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PanelStack from '@common/components/PanelCard/PanelStack';
import SystemStatsCard from '@module/feature/components/SystemStatsCard';
import FormDemoCard from '@module/feature/components/FormDemoCard';
import StateDemoCard from '@module/feature/components/StateDemoCard';

/**
 * Renders the Demo page exercising all UMD window dependencies:
 * React, React Query, react-hook-form, @hookform/resolvers/yup, yup,
 * react-toastify, Jotai, Jotai/utils, and Wouter.
 *
 * @return {ReactElement} The rendered Dashboard component
 */
const Dashboard = () => (
    <div className="text-center my-5">
        <h1 className="mb-3">Demo Module</h1>
        <p className="mb-4">
            UMD module smoke test. Exercises all window dependencies provided by the main application.
        </p>

        <PanelStack>
            <SystemStatsCard />
            <FormDemoCard />
            <StateDemoCard />
        </PanelStack>
    </div>
);

export default Dashboard;
