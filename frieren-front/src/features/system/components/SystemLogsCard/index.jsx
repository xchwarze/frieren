/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useState, useMemo } from 'react';

import PanelCard from '@src/components/PanelCard';
import PanelTable from '@src/components/PanelTable';
import SkeletonBar from '@src/components/SkeletonBar';
import SkeletonTable from '@src/components/SkeletonBar/SkeletonTable';
import SearchInput from '@src/components/SearchInput';
import useGetSystemLogs from '@src/features/system/hooks/useGetSystemLogs.js';
import useDebouncedValue from '@src/hooks/useDebouncedValue.js';

/**
 * Generates a card displaying system logs. Only the last 1000 events are shown for performance reasons.
 *
 * @return {ReactElement} The SystemLogsCard component
 */
const SystemLogsCard = () => {
    const { data, isSuccess, isLoading, isFetching, refetch } = useGetSystemLogs();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm);

    const filteredLogs = useMemo(() => {
        if (!debouncedSearch || !data) {
            return data;
        }
        const term = debouncedSearch.toLowerCase();
        return data.filter(({ tag, process, message }) =>
            tag.toLowerCase().includes(term)
            || process.toLowerCase().includes(term)
            || message.toLowerCase().includes(term)
        );
    }, [data, debouncedSearch]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <>
                    <div className={'mb-3'}>
                        <SkeletonBar width={250} height={38} barHeight={34} />
                    </div>
                    <SkeletonTable
                        headers={['Date', 'Tag', 'Process', 'Message']}
                        widths={[110, 60, 70, 200]}
                        rows={5}
                    />
                </>
            );
        }

        if (isSuccess) {
            return (
                <>
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={'Search logs...'}
                        className={'mb-3'}
                    />
                    <PanelTable>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tag</th>
                            <th>Process</th>
                            <th>Message</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(filteredLogs ?? []).map(({ timestamp, tag, process, message }) => (
                            <tr key={`${timestamp}-${tag}-${process}-${message}`}>
                                <td>{timestamp}</td>
                                <td>{tag}</td>
                                <td>{process}</td>
                                <td>{message}</td>
                            </tr>
                        ))}
                        {(filteredLogs ?? []).length === 0 && (
                            <tr>
                                <td colSpan={4}>No logs found.</td>
                            </tr>
                        )}
                        </tbody>
                    </PanelTable>
                </>
            );
        }

        return null;
    };

    return (
        <PanelCard
            title={'System Log'}
            icon={'file-text'}
            subtitle={'For performance reasons only the last 1000 events are shown. If you want to see more you ' +
                'can use the terminal or the diagnostics section.'}
            isFetching={isFetching}
            refetch={refetch}
        >
            {renderContent()}
        </PanelCard>
    );
};

export default SystemLogsCard;
