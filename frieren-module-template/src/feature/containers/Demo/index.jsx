/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import SystemStatsCard from '@module/feature/components/SystemStatsCard';

/**
 * Renders the Dashboard component, displaying the SystemStatsCard and SystemInfoCard components.
 *
 * @return {ReactElement} The rendered Dashboard component
 */
const Dashboard = () => (
    <div className="text-center my-5">
        <h1 className="mb-3">Demo Module</h1>
        <p className="mb-4">This is a JavaScript UMD module that loads at runtime. For more information you can check
            the documentation and view the source code.</p>

        <div className="mx-y">
            <SystemStatsCard />
        </div>

        <div className="ratio ratio-16x9 mx-auto">
            <iframe
                className="embed-responsive-item"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=2bDQQE8CqXyS-713"
                title="YouTube video player" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
            />
        </div>
    </div>
)
;

export default Dashboard;
