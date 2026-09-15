/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen } from '@testing-library/react';

import SystemStatsCard from '@src/features/dashboard/components/SystemStatsCard/index.jsx';
import useSystemStats from '@src/features/dashboard/hooks/useSystemStats.js';

vi.mock('@src/features/dashboard/hooks/useSystemStats.js', () => ({ default: vi.fn() }));

describe('SystemStatsCard', () => {
    beforeEach(() => {
        useSystemStats.mockReset();
    });

    it('shows a skeleton placeholder for each stat while loading', () => {
        useSystemStats.mockReturnValue({ isLoading: true, isSuccess: false, isFetching: true, refetch: vi.fn() });

        const { container } = render(<SystemStatsCard />);

        ['cpu usage', 'memory', 'swap', 'uptime'].forEach((label) => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
        expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
    });

    it('renders each stat value once loaded', () => {
        useSystemStats.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
            data: { cpu_usage: '12%', memory_used: '45%', swap_used: '0%', uptime: '3d 4h' },
        });

        render(<SystemStatsCard />);

        expect(screen.getByText('12%')).toBeInTheDocument();
        expect(screen.getByText('45%')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('3d 4h')).toBeInTheDocument();
    });

    it('renders an empty value instead of crashing when a stat key is missing from the response', () => {
        useSystemStats.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
            data: { cpu_usage: '12%' },
        });

        render(<SystemStatsCard />);

        const uptimeGroup = screen.getByText('uptime').closest('div');
        expect(uptimeGroup.querySelector('p')).toHaveTextContent('');
    });

    it('calls refetch when the refresh button is clicked', () => {
        const refetch = vi.fn();
        useSystemStats.mockReturnValue({ isLoading: false, isSuccess: true, isFetching: false, refetch, data: {} });

        render(<SystemStatsCard />);
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('disables the refresh button while fetching', () => {
        useSystemStats.mockReturnValue({
            isLoading: false,
            isSuccess: true,
            isFetching: true,
            refetch: vi.fn(),
            data: {},
        });

        render(<SystemStatsCard />);

        expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    });
});
