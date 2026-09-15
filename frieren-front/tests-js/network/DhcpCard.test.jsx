/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `useAddStaticLease` is mocked purely because AddStaticLeaseModal (always mounted, even
 * hidden) calls it unconditionally — its own add-flow validation/submit behavior is covered
 * by AddStaticLeaseModal.test.jsx, not duplicated here. This file covers DhcpCard's own
 * logic: the leases search filter, expiry formatting and the static-lease delete flow.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import DhcpCard from '@src/features/network/components/DhcpCard/index.jsx';
import useGetDhcpLeases from '@src/features/network/hooks/useGetDhcpLeases.js';
import useGetStaticLeases from '@src/features/network/hooks/useGetStaticLeases.js';
import useDeleteStaticLease from '@src/features/network/hooks/useDeleteStaticLease.js';
import useAddStaticLease from '@src/features/network/hooks/useAddStaticLease.js';

vi.mock('@src/features/network/hooks/useGetDhcpLeases.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useGetStaticLeases.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useDeleteStaticLease.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useAddStaticLease.js', () => ({ default: vi.fn() }));

const leases = [
    { hostname: 'phone', ip: '192.168.1.10', mac: 'aa:aa:aa:aa:aa:aa', expires: 1700000000 },
    // formatExpires checks `!expires` before `expires <= 0`, so 0 (falsy) is swallowed by
    // the first branch and rendered as '-', not 'Infinite' — only a negative value reaches
    // the second branch. This is the component's actual current behavior, verified as-is.
    { hostname: 'router-guest', ip: '192.168.1.11', mac: 'bb:bb:bb:bb:bb:bb', expires: -1 },
    { hostname: '', ip: '192.168.1.12', mac: 'cc:cc:cc:cc:cc:cc', expires: 1700000001 },
    { hostname: 'printer', ip: '192.168.1.13', mac: 'dd:dd:dd:dd:dd:dd', expires: null },
    { hostname: 'zero-lease', ip: '192.168.1.14', mac: 'ff:ff:ff:ff:ff:ff', expires: 0 },
];

const staticLeases = [
    { name: 'nas', mac: 'ee:ee:ee:ee:ee:ee', ip: '192.168.1.50' },
];

const deleteMutation = vi.fn();
const leaseRowByIp = (ip) => screen.getByText(ip).closest('tr');

describe('DhcpCard', () => {
    beforeEach(() => {
        deleteMutation.mockReset().mockResolvedValue({});
        useGetDhcpLeases.mockReturnValue({
            data: { leases },
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
        });
        useGetStaticLeases.mockReturnValue({
            data: { leases: staticLeases },
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
        });
        useDeleteStaticLease.mockReturnValue({ mutateAsync: deleteMutation, isPending: false });
        useAddStaticLease.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
    });

    it('falls back to a dash for a missing hostname', () => {
        render(<DhcpCard />);

        expect(within(leaseRowByIp('192.168.1.12')).getByText('-')).toBeInTheDocument();
    });

    it('renders a negative expiry as Infinite', () => {
        render(<DhcpCard />);

        expect(within(leaseRowByIp('192.168.1.11')).getByText('Infinite')).toBeInTheDocument();
    });

    it('renders an expires of exactly 0 as a dash, not Infinite', () => {
        render(<DhcpCard />);

        const cell = within(leaseRowByIp('192.168.1.14'));
        expect(cell.getByText('-')).toBeInTheDocument();
        expect(cell.queryByText('Infinite')).not.toBeInTheDocument();
    });

    it('renders a missing expiry as a dash, distinct from Infinite', () => {
        render(<DhcpCard />);

        const cell = within(leaseRowByIp('192.168.1.13'));
        expect(cell.getByText('-')).toBeInTheDocument();
        expect(cell.queryByText('Infinite')).not.toBeInTheDocument();
    });

    it('filters leases by hostname, ip or mac as the search box is typed', async () => {
        render(<DhcpCard />);

        fireEvent.change(screen.getByPlaceholderText('Search leases...'), { target: { value: 'bb:bb' } });

        await waitFor(() => expect(screen.queryByText('192.168.1.10')).not.toBeInTheDocument());
        expect(screen.getByText('192.168.1.11')).toBeInTheDocument();
        expect(screen.queryByText('192.168.1.12')).not.toBeInTheDocument();
    });

    it('shows an empty-state row when the search matches nothing', async () => {
        render(<DhcpCard />);

        fireEvent.change(screen.getByPlaceholderText('Search leases...'), { target: { value: 'no-such-lease' } });

        expect(await screen.findByText('No leases found.')).toBeInTheDocument();
    });

    it('renders the configured static leases', () => {
        render(<DhcpCard />);

        const row = screen.getByText('nas').closest('tr');
        expect(within(row).getByText('192.168.1.50')).toBeInTheDocument();
    });

    it('shows an empty-state row when there are no static leases', () => {
        useGetStaticLeases.mockReturnValue({ data: { leases: [] }, isSuccess: true, isFetching: false, refetch: vi.fn() });

        render(<DhcpCard />);

        expect(screen.getByText('No static leases configured.')).toBeInTheDocument();
    });

    it('asks for confirmation before deleting a static lease, naming it', () => {
        render(<DhcpCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('nas')).toBeInTheDocument();
        expect(within(dialog).getByText('ee:ee:ee:ee:ee:ee')).toBeInTheDocument();
        expect(deleteMutation).not.toHaveBeenCalled();
    });

    it('deletes the static lease by mac only after confirmation', async () => {
        render(<DhcpCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm' }));

        await waitFor(() => expect(deleteMutation).toHaveBeenCalledWith({ mac: 'ee:ee:ee:ee:ee:ee' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('does not delete when the confirmation is cancelled', async () => {
        render(<DhcpCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

        // The modal fades out (react-bootstrap Transition), so it briefly stays in the
        // DOM after the click.
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(deleteMutation).not.toHaveBeenCalled();
    });

    it('opens the add-static-lease modal from the Add button', () => {
        render(<DhcpCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Add' }));

        expect(screen.getByText('Add Static Lease')).toBeInTheDocument();
    });
});
