/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DiagnosticsCard from '@src/features/network/components/DiagnosticsCard/index.jsx';
import useRunPing from '@src/features/network/hooks/useRunPing.js';
import useRunTraceroute from '@src/features/network/hooks/useRunTraceroute.js';
import useRunNslookup from '@src/features/network/hooks/useRunNslookup.js';
import useGetArpTable from '@src/features/network/hooks/useGetArpTable.js';

vi.mock('@src/features/network/hooks/useRunPing.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useRunTraceroute.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useRunNslookup.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useGetArpTable.js', () => ({ default: vi.fn() }));

const pingMutation = vi.fn();
const tracerouteMutation = vi.fn();
const nslookupMutation = vi.fn();

const neighbors = [
    { ip: '192.168.1.1', mac: 'aa:bb:cc:dd:ee:ff', device: 'br-lan', state: 'REACHABLE' },
];

const setHost = (value) => fireEvent.change(screen.getByLabelText('Host'), { target: { value } });
const outputBox = () => screen.getByLabelText('Output');

describe('DiagnosticsCard', () => {
    beforeEach(() => {
        pingMutation.mockReset().mockResolvedValue({ output: 'PING ok' });
        tracerouteMutation.mockReset().mockResolvedValue({ output: 'TRACE ok' });
        nslookupMutation.mockReset().mockResolvedValue({ output: 'NSLOOKUP ok' });
        useRunPing.mockReturnValue({ mutateAsync: pingMutation, isPending: false });
        useRunTraceroute.mockReturnValue({ mutateAsync: tracerouteMutation, isPending: false });
        useRunNslookup.mockReturnValue({ mutateAsync: nslookupMutation, isPending: false });
        useGetArpTable.mockReturnValue({
            data: { neighbors },
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
        });
    });

    it('disables every tool button until a host is entered', () => {
        render(<DiagnosticsCard />);

        expect(screen.getByRole('button', { name: 'Ping' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Traceroute' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Nslookup' })).toBeDisabled();

        setHost('example.com');

        expect(screen.getByRole('button', { name: 'Ping' })).not.toBeDisabled();
    });

    it('treats a whitespace-only host as empty', () => {
        render(<DiagnosticsCard />);

        setHost('   ');

        expect(screen.getByRole('button', { name: 'Ping' })).toBeDisabled();
    });

    it('runs ping with the trimmed host and renders its output', async () => {
        render(<DiagnosticsCard />);

        setHost('  example.com  ');
        fireEvent.click(screen.getByRole('button', { name: 'Ping' }));

        expect(pingMutation).toHaveBeenCalledWith({ host: 'example.com' });
        await waitFor(() => expect(outputBox()).toHaveValue('PING ok'));
    });

    it('runs traceroute and nslookup independently, calling only their own mutation', async () => {
        render(<DiagnosticsCard />);
        setHost('example.com');

        fireEvent.click(screen.getByRole('button', { name: 'Traceroute' }));

        await waitFor(() => expect(outputBox()).toHaveValue('TRACE ok'));
        expect(pingMutation).not.toHaveBeenCalled();
        expect(nslookupMutation).not.toHaveBeenCalled();
    });

    it('shows a failure message in the output when the command rejects', async () => {
        pingMutation.mockRejectedValue(new Error('unreachable'));
        render(<DiagnosticsCard />);
        setHost('example.com');

        fireEvent.click(screen.getByRole('button', { name: 'Ping' }));

        await waitFor(() => expect(outputBox()).toHaveValue('Command failed.'));
    });

    it('shows a placeholder before any command has run', () => {
        render(<DiagnosticsCard />);

        expect(outputBox()).toHaveValue('No output yet.');
    });

    it('disables all tool buttons while any one of them is running', () => {
        useRunTraceroute.mockReturnValue({ mutateAsync: tracerouteMutation, isPending: true });
        render(<DiagnosticsCard />);

        setHost('example.com');

        expect(screen.getByRole('button', { name: 'Ping' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Traceroute' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Nslookup' })).toBeDisabled();
    });

    it('renders the ARP table with a discovered neighbor', () => {
        render(<DiagnosticsCard />);

        const row = screen.getByText('192.168.1.1').closest('tr');
        expect(row).toHaveTextContent('aa:bb:cc:dd:ee:ff');
        expect(row).toHaveTextContent('br-lan');
        expect(row).toHaveTextContent('REACHABLE');
    });

    it('shows an empty-state row when there are no ARP neighbors', () => {
        useGetArpTable.mockReturnValue({ data: { neighbors: [] }, isSuccess: true, isFetching: false, refetch: vi.fn() });

        render(<DiagnosticsCard />);

        expect(screen.getByText('No neighbors found.')).toBeInTheDocument();
    });

    it('shows the loading skeleton instead of the ARP table while the query is pending', () => {
        useGetArpTable.mockReturnValue({ data: undefined, isSuccess: false, isFetching: true, refetch: vi.fn() });

        render(<DiagnosticsCard />);

        expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
        expect(screen.queryByText('192.168.1.1')).not.toBeInTheDocument();
    });
});
