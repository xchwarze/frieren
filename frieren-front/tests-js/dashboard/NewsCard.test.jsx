/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, within } from '@testing-library/react';

import NewsCard from '@src/features/dashboard/components/NewsCard/index.jsx';
import useNews from '@src/features/dashboard/hooks/useNews.js';

vi.mock('@src/features/dashboard/hooks/useNews.js', () => ({ default: vi.fn() }));

describe('NewsCard', () => {
    beforeEach(() => {
        useNews.mockReset();
    });

    it('shows a 3-row skeleton table while loading', () => {
        useNews.mockReturnValue({ isLoading: true, isSuccess: false, isFetching: true, refetch: vi.fn() });

        render(<NewsCard />);

        expect(screen.getByText('Date')).toBeInTheDocument();
        // SkeletonTable marks its table aria-hidden, so rows must be queried explicitly.
        // 1 header row + 3 skeleton rows
        expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(4);
    });

    it('renders each news item, including HTML in the description', () => {
        useNews.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
            data: { news: [{ date: '2026-01-01', title: 'Release', description: '<b>notes</b>' }] },
        });

        render(<NewsCard />);

        const row = screen.getByText('Release').closest('tr');
        expect(within(row).getByText('2026-01-01')).toBeInTheDocument();
        expect(within(row).getByText('notes')).toBeInTheDocument();
    });

    it('shows an empty-state row when the backend reports no news', () => {
        useNews.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
            data: { news: [] },
        });

        render(<NewsCard />);

        expect(screen.getByText('No news found.')).toBeInTheDocument();
    });

    it('treats a missing news array the same as an empty one', () => {
        useNews.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
            data: {},
        });

        render(<NewsCard />);

        expect(screen.getByText('No news found.')).toBeInTheDocument();
    });

    it('calls refetch when the refresh button is clicked', () => {
        const refetch = vi.fn();
        useNews.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch,
            data: { news: [] },
        });

        render(<NewsCard />);
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

        expect(refetch).toHaveBeenCalledTimes(1);
    });
});
