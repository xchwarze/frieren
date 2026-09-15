/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, within } from '@testing-library/react';

import AssociationListCard from '@src/features/wireless/components/AssociationListCard/index.jsx';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';
import useGetAssociationList from '@src/features/wireless/hooks/useGetAssociationList.js';

vi.mock('@src/features/wireless/hooks/useGetWirelessOverview.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useGetAssociationList.js', () => ({ default: vi.fn() }));

const overviewWithTwoApInterfaces = {
    radio0: {
        interfaces: [
            { ifname: 'wlan0', mode: 'ap' },
            { ifname: 'wlan0-1', mode: 'sta' }, // not an AP: excluded from the interface picker
        ],
    },
    radio1: {
        interfaces: [
            { ifname: 'wlan1', mode: 'Master' }, // OpenWrt's raw iwinfo mode name for AP
            { ifname: null, mode: 'ap' }, // no ifname yet (interface not up): excluded
        ],
    },
};

const clients = [
    { mac: '11:11:11:11:11:11', signal: -40, noise: -95, rx_rate: '6.0', tx_rate: '54.0' },
    { mac: '22:22:22:22:22:22', signal: -70, noise: -80, rx_rate: '54.0', tx_rate: '6.0' },
];

describe('AssociationListCard', () => {
    const refetch = vi.fn();

    beforeEach(() => {
        refetch.mockReset();
        useGetWirelessOverview.mockReturnValue({ data: overviewWithTwoApInterfaces });
        useGetAssociationList.mockReturnValue({ data: clients, refetch, isFetching: false });
    });

    it('offers only AP-mode interfaces with a resolved ifname in the picker', () => {
        render(<AssociationListCard />);

        const select = screen.getByRole('combobox');
        expect(within(select).getByRole('option', { name: 'wlan0' })).toBeInTheDocument();
        expect(within(select).getByRole('option', { name: 'wlan1' })).toBeInTheDocument();
        expect(within(select).queryByRole('option', { name: 'wlan0-1' })).not.toBeInTheDocument();
        expect(within(select).getAllByRole('option')).toHaveLength(2);
    });

    it('defaults to the first AP interface and queries its association list', () => {
        render(<AssociationListCard />);

        expect(useGetAssociationList).toHaveBeenCalledWith('wlan0');
    });

    it('re-queries the association list for the interface picked from the dropdown', () => {
        render(<AssociationListCard />);

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'wlan1' } });

        expect(useGetAssociationList).toHaveBeenLastCalledWith('wlan1');
    });

    it('sorts by signal (strongest first) by default', () => {
        render(<AssociationListCard />);

        const rows = screen.getAllByRole('row').slice(1); // drop the header row
        expect(within(rows[0]).getByText('11:11:11:11:11:11')).toBeInTheDocument();
        expect(within(rows[1]).getByText('22:22:22:22:22:22')).toBeInTheDocument();
    });

    it('re-sorts by MAC address alphabetically when that column header is clicked', () => {
        render(<AssociationListCard />);

        fireEvent.click(screen.getByRole('button', { name: /MAC Address/ }));

        const rows = screen.getAllByRole('row').slice(1);
        expect(within(rows[0]).getByText('11:11:11:11:11:11')).toBeInTheDocument();
        expect(within(rows[1]).getByText('22:22:22:22:22:22')).toBeInTheDocument();
    });

    it('sorts by TX rate as a number, not a string, so 54.0 outranks 6.0', () => {
        render(<AssociationListCard />);

        fireEvent.click(screen.getByRole('button', { name: /TX Rate/ }));

        const rows = screen.getAllByRole('row').slice(1);
        expect(within(rows[0]).getByText('11:11:11:11:11:11')).toBeInTheDocument(); // tx_rate 54.0
        expect(within(rows[1]).getByText('22:22:22:22:22:22')).toBeInTheDocument(); // tx_rate 6.0
    });

    it('shows a placeholder row when no stations are associated', () => {
        useGetAssociationList.mockReturnValue({ data: [], refetch, isFetching: false });

        render(<AssociationListCard />);

        expect(screen.getByText('No associated stations')).toBeInTheDocument();
    });

    it('hides the interface picker entirely when the overview has no AP interfaces', () => {
        useGetWirelessOverview.mockReturnValue({ data: { radio0: { interfaces: [] } } });
        useGetAssociationList.mockReturnValue({ data: [], refetch, isFetching: false });

        render(<AssociationListCard />);

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});
