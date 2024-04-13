/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { Table } from 'react-bootstrap';

import PanelCard from '@src/components/PanelCard';
import useGetSystemLogs from '@src/features/hardware/hooks/useGetSystemLogs.js';

/**
 * Generates a card displaying system logs. Only the last 1000 events are shown for performance reasons.
 *
 * @return {ReactElement} The SystemLogsCard component
 */
const SystemLogsCard = () => {
    const query = useGetSystemLogs();
    const { data, isSuccess } = query;

    return (
        <PanelCard
            title={'System Log'}
            subtitle={'For performance reasons only the last 1000 events are shown. If you want to see more you ' +
                'can use the terminal or the diagnostics section.'}
            query={query}
        >
            {isSuccess && (
                <Table className={'mt-4'} striped hover responsive>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tag</th>
                        <th>Process</th>
                        <th>Message</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map(({ timestamp, tag, process, message }, index) => (
                        <tr key={index}>
                            <td>{timestamp}</td>
                            <td>{tag}</td>
                            <td>{process}</td>
                            <td>{message}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </PanelCard>
    );
};

export default SystemLogsCard;
