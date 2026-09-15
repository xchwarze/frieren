/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { render, screen } from '@testing-library/react';

import SystemInfoCard from '@src/features/dashboard/components/SystemInfoCard/index.jsx';
import useSystemResume from '@src/features/dashboard/hooks/useSystemResume.js';

vi.mock('@src/features/dashboard/hooks/useSystemResume.js', () => ({ default: vi.fn() }));

const resumeData = {
    hostname: 'router1',
    model: 'Acme X1',
    system: 'MIPS',
    release: { target: 'ramips/mt7621', distribution: 'OpenWrt', version: '24.10.6', revision: 'r12345' },
    kernel: '5.15.167',
};

describe('SystemInfoCard', () => {
    beforeEach(() => {
        useSystemResume.mockReset();
    });

    it('shows a 6-row skeleton table while loading', () => {
        useSystemResume.mockReturnValue({ isLoading: true, isSuccess: false, data: undefined });

        render(<SystemInfoCard />);

        // SkeletonTable marks its table aria-hidden, so rows must be queried explicitly.
        expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(6);
    });

    it('renders the device summary, assembling the firmware version from its three parts', () => {
        useSystemResume.mockReturnValue({ isLoading: false, isSuccess: true, data: resumeData });

        render(<SystemInfoCard />);

        expect(screen.getByText('router1')).toBeInTheDocument();
        expect(screen.getByText('Acme X1')).toBeInTheDocument();
        expect(screen.getByText('MIPS')).toBeInTheDocument();
        expect(screen.getByText('ramips/mt7621')).toBeInTheDocument();
        expect(screen.getByText('OpenWrt 24.10.6 r12345')).toBeInTheDocument();
        expect(screen.getByText('5.15.167')).toBeInTheDocument();
    });

    // This card is display-only (no refetch handler is passed to PanelCard), so it must
    // opt out of the refresh button explicitly rather than relying on PanelCard's default.
    it('never shows a refresh button', () => {
        useSystemResume.mockReturnValue({ isLoading: false, isSuccess: true, data: resumeData });

        render(<SystemInfoCard />);

        expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    });

    it('renders no table when the query is neither loading nor successful', () => {
        useSystemResume.mockReturnValue({ isLoading: false, isSuccess: false, data: undefined });

        render(<SystemInfoCard />);

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});
