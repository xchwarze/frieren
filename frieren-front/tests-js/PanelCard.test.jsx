/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The real PanelCard (and the real Button/Icon it renders) — this is the host app, so nothing
 * here needs mocking, unlike a third-party module testing against the shared SDK.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PanelCard from '@src/components/PanelCard';

describe('PanelCard', () => {
    it('renders the title and a leading icon', () => {
        render(<PanelCard title={'Status'} icon={'activity'}>content</PanelCard>);

        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(document.querySelector('.icon-activity')).toBeInTheDocument();
    });

    it('renders the subtitle only when provided', () => {
        const { rerender } = render(<PanelCard title={'X'}>content</PanelCard>);
        expect(screen.queryByText('a subtitle')).not.toBeInTheDocument();

        rerender(<PanelCard title={'X'} subtitle={'a subtitle'}>content</PanelCard>);
        expect(screen.getByText('a subtitle')).toBeInTheDocument();
    });

    /**
     * Documents a known, intentional-for-now UX footgun (TODO-1.5.md item M8): a PanelCard
     * with no `refetch` still renders an enabled refresh button. This test PINS today's
     * behavior; if `showRefresh`'s default is ever changed to derive from `refetch`, update
     * this test alongside the fix rather than being surprised by it.
     */
    it('shows an enabled refresh button by default, even without a refetch handler', () => {
        render(<PanelCard title={'Static'}>content</PanelCard>);

        const refreshButton = screen.getByRole('button', { name: 'Refresh' });
        expect(refreshButton).toBeInTheDocument();
        expect(refreshButton).not.toBeDisabled();
    });

    it('hides the refresh button when showRefresh is false', () => {
        render(<PanelCard title={'Static'} showRefresh={false}>content</PanelCard>);

        expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    });

    it('calls refetch when the refresh button is clicked', async () => {
        const refetch = vi.fn();
        render(<PanelCard title={'X'} refetch={refetch}>content</PanelCard>);

        await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('disables the refresh button while fetching', () => {
        render(<PanelCard title={'X'} isFetching>content</PanelCard>);

        expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    });

    it('renders children inside the card body', () => {
        render(<PanelCard title={'X'}><p>child content</p></PanelCard>);

        expect(screen.getByText('child content')).toBeInTheDocument();
    });
});
