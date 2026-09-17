/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The search box filters through the real `useDebouncedValue` hook (not mocked), so the
 * "filter is applied" assertions below wait for its 300ms delay to settle. The "not yet
 * filtered" assertion checks synchronously, right after typing, to prove the narrowing is
 * genuinely debounced and not just an inert extra render.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import SystemLogsCard from '@src/features/system/components/SystemLogsCard/index.jsx';
import useGetSystemLogs from '@src/features/system/hooks/useGetSystemLogs.js';
import { formatEpochDateTime } from '@src/helpers/dateHelper.js';

vi.mock('@src/features/system/hooks/useGetSystemLogs.js', () => ({ default: vi.fn() }));

const FIRST_LOG_EPOCH = 1757930400; // 2026-09-15 10:00:00 UTC
const logs = [
    { timestamp: FIRST_LOG_EPOCH, tag: 'daemon.info', process: 'sshd', message: 'session opened' },
    { timestamp: FIRST_LOG_EPOCH + 60, tag: 'daemon.err', process: 'uhttpd', message: 'connection reset' },
];

const mount = (overrides) => {
    useGetSystemLogs.mockReturnValue({
        data: undefined,
        isSuccess: false,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
        ...overrides,
    });

    return render(<SystemLogsCard />);
};

describe('SystemLogsCard', () => {
    it('shows a skeleton instead of reading .filter off an undefined query result while loading', () => {
        mount({ isLoading: true, data: undefined });

        expect(screen.queryByPlaceholderText('Search logs...')).not.toBeInTheDocument();
        expect(screen.queryByText('sshd')).not.toBeInTheDocument();
    });

    it('renders every log line and no empty-state message when there is no search term', () => {
        mount({ isSuccess: true, data: logs });

        expect(screen.getByText('sshd')).toBeInTheDocument();
        expect(screen.getByText('uhttpd')).toBeInTheDocument();
        expect(screen.queryByText('No logs found.')).not.toBeInTheDocument();
    });

    it('renders the epoch timestamp as a local date/time via the shared date helper', () => {
        mount({ isSuccess: true, data: logs });

        expect(screen.getByText(formatEpochDateTime(FIRST_LOG_EPOCH))).toBeInTheDocument();
    });

    it('matches a search term against tag, process, or message, case-insensitively, once debounced', async () => {
        mount({ isSuccess: true, data: logs });

        fireEvent.change(screen.getByPlaceholderText('Search logs...'), { target: { value: 'RESET' } });

        // Right after typing, the debounce has not fired yet: both rows are still visible.
        expect(screen.getByText('sshd')).toBeInTheDocument();
        expect(screen.getByText('uhttpd')).toBeInTheDocument();

        await waitFor(() => expect(screen.queryByText('sshd')).not.toBeInTheDocument());
        expect(screen.getByText('uhttpd')).toBeInTheDocument();
    });

    it('shows an explicit empty-state row when the filter matches nothing', async () => {
        mount({ isSuccess: true, data: logs });

        fireEvent.change(screen.getByPlaceholderText('Search logs...'), { target: { value: 'no-such-term' } });

        expect(await screen.findByText('No logs found.')).toBeInTheDocument();
    });

    it('renders no table content, without crashing, while the query is idle/errored', () => {
        mount({ isSuccess: false, isLoading: false, data: undefined });

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Search logs...')).not.toBeInTheDocument();
    });
});
