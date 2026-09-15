/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `useSetInterface` is mocked purely so the real InterfaceFormModal/InterfaceForm can mount
 * during the edit flow without a QueryClientProvider — their own submit/validation behavior
 * is covered by InterfaceForm.test.jsx, not re-tested here.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import InterfacesCard from '@src/features/network/components/InterfacesCard/index.jsx';
import useGetInterfaces from '@src/features/network/hooks/useGetInterfaces.js';
import useToggleInterface from '@src/features/network/hooks/useToggleInterface.js';
import useSetInterface from '@src/features/network/hooks/useSetInterface.js';

vi.mock('@src/features/network/hooks/useGetInterfaces.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useToggleInterface.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/network/hooks/useSetInterface.js', () => ({ default: vi.fn() }));

const interfaces = [
    { name: 'lan', proto: 'static', ipaddr: '192.168.1.1', netmask: '255.255.255.0', gateway: '', up: true, device: 'br-lan', uptime: '1d 2h' },
    { name: 'wan', proto: 'dhcp', ipaddr: '', netmask: '', gateway: '192.168.1.254', up: false, device: 'eth0', uptime: '' },
];

const rowFor = (name) => screen.getByText(name).closest('tr');

const toggleMutate = vi.fn();

describe('InterfacesCard', () => {
    beforeEach(() => {
        toggleMutate.mockReset();
        useGetInterfaces.mockReturnValue({
            data: { interfaces },
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
        });
        useToggleInterface.mockReturnValue({ mutate: toggleMutate, isPending: false });
        useSetInterface.mockReturnValue({ mutateAsync: vi.fn().mockResolvedValue({}) });
    });

    it('renders each interface row with its addressing, gateway fallback and status', () => {
        render(<InterfacesCard />);

        const lanRow = within(rowFor('lan'));
        expect(lanRow.getByText('192.168.1.1 / 255.255.255.0')).toBeInTheDocument();
        expect(lanRow.getByText('-')).toBeInTheDocument(); // gateway fallback
        expect(lanRow.getByText('Up')).toBeInTheDocument();

        const wanRow = within(rowFor('wan'));
        expect(wanRow.getByText('192.168.1.254')).toBeInTheDocument();
        expect(wanRow.getByText('Down')).toBeInTheDocument();
    });

    it('shows the loading skeleton instead of the table while the query is pending', () => {
        useGetInterfaces.mockReturnValue({ data: undefined, isSuccess: false, isFetching: true, refetch: vi.fn() });

        render(<InterfacesCard />);

        // SkeletonTable marks its table aria-hidden, so rows must be queried explicitly:
        // 1 header row + 3 default skeleton body rows.
        expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(4);
        expect(screen.queryByText('lan')).not.toBeInTheDocument();
    });

    it('shows an empty-state row when there are no interfaces', () => {
        useGetInterfaces.mockReturnValue({ data: { interfaces: [] }, isSuccess: true, isFetching: false, refetch: vi.fn() });

        render(<InterfacesCard />);

        expect(screen.getByText('No interfaces found.')).toBeInTheDocument();
    });

    it('brings an up interface down', () => {
        render(<InterfacesCard />);

        fireEvent.click(within(rowFor('lan')).getByRole('button', { name: 'Bring down' }));

        expect(toggleMutate).toHaveBeenCalledWith({ name: 'lan', action: 'down' });
    });

    it('brings a down interface up', () => {
        render(<InterfacesCard />);

        fireEvent.click(within(rowFor('wan')).getByRole('button', { name: 'Bring up' }));

        expect(toggleMutate).toHaveBeenCalledWith({ name: 'wan', action: 'up' });
    });

    it('only disables the row being toggled, not every interface', () => {
        useToggleInterface.mockReturnValue({ mutate: toggleMutate, isPending: true });
        render(<InterfacesCard />);

        fireEvent.click(within(rowFor('lan')).getByRole('button', { name: 'Bring down' }));

        expect(within(rowFor('lan')).getByRole('button', { name: 'Bring down' })).toBeDisabled();
        expect(within(rowFor('lan')).getByRole('button', { name: 'Edit' })).toBeDisabled();
        expect(within(rowFor('wan')).getByRole('button', { name: 'Bring up' })).not.toBeDisabled();
        expect(within(rowFor('wan')).getByRole('button', { name: 'Edit' })).not.toBeDisabled();
    });

    it('opens the edit modal for the selected interface only', () => {
        render(<InterfacesCard />);

        fireEvent.click(within(rowFor('wan')).getByRole('button', { name: 'Edit' }));

        expect(screen.getByText('Edit Interface')).toBeInTheDocument();
        // ReadOnlyField's label isn't programmatically associated with its control, so it
        // can't be found via getByLabelText.
        expect(screen.getByDisplayValue('wan')).toBeInTheDocument();
    });

    it('closes the edit modal on cancel', async () => {
        render(<InterfacesCard />);

        fireEvent.click(within(rowFor('lan')).getByRole('button', { name: 'Edit' }));
        expect(screen.getByText('Edit Interface')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        // The modal fades out (react-bootstrap Transition), so it briefly stays in the
        // DOM after the click.
        await waitFor(() => expect(screen.queryByText('Edit Interface')).not.toBeInTheDocument());
    });
});
