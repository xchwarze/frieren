/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `RadioSection` renders the real Button/StatusBadge/PanelTable/ConfirmationModal it composes
 * (all simple, host-owned) and mocks only its own feature hooks. Coverage focuses on the
 * per-radio/per-interface derivation logic that is unique to this component: status-word to
 * label mapping, the checking-section skeleton swap (existing vs. brand-new interface), the
 * empty-vs-pending-skeleton interaction, and the remove/toggle wiring.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';

import RadioSection from '@src/features/wireless/components/WirelessOverviewCard/RadioSection.jsx';
import useRemoveInterface from '@src/features/wireless/hooks/useRemoveInterface.js';
import useToggleInterface from '@src/features/wireless/hooks/useToggleInterface.js';

vi.mock('@src/features/wireless/hooks/useRemoveInterface.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useToggleInterface.js', () => ({ default: vi.fn() }));

const baseRadio = {
    band: '5GHz',
    disabled: false,
    up: true,
    hardware: 'MT7915',
    channel: 36,
    htmode: 'HE80',
    hwmodes: '11a/n/ac/ax',
    interfaces: [
        { section: 'wifinet0', ifname: 'wlan0', ssid: 'MyNet', mode: 'ap', bssid: 'AA:BB:CC:DD:EE:FF', encryption: 'psk2', disabled: false, up: true },
        { section: 'wifinet1', ifname: 'wlan0-1', ssid: 'Guest', mode: 'ap', bssid: null, encryption: null, disabled: true, up: false },
    ],
};

const removeInterface = vi.fn();
const toggleInterface = vi.fn();

const noop = () => {};
const renderSection = (overrides = {}) => render(
    <RadioSection
        radioName={'radio0'}
        radio={baseRadio}
        onScan={noop}
        onEdit={noop}
        onAdd={noop}
        onConfigure={noop}
        checkingSection={null}
        checkingRadio={null}
        {...overrides}
    />
);

const rowFor = (text) => screen.getByText(text).closest('tr');

describe('RadioSection', () => {
    beforeEach(() => {
        removeInterface.mockReset();
        toggleInterface.mockReset();
        useRemoveInterface.mockReturnValue({ mutate: removeInterface, isPending: false });
        useToggleInterface.mockReturnValue({ mutate: toggleInterface, isPending: false });
    });

    it('renders the radio header and each interface row with its raw values', () => {
        renderSection();

        expect(screen.getByText('RADIO0')).toBeInTheDocument();
        expect(screen.getByText('5GHz')).toBeInTheDocument();
        expect(screen.getByText(/MT7915/)).toBeInTheDocument();
        expect(screen.getByText(/Channel 36/)).toBeInTheDocument();
        expect(screen.getByText(/HE80/)).toBeInTheDocument();

        expect(within(rowFor('MyNet')).getByText('wlan0')).toBeInTheDocument();
        expect(within(rowFor('MyNet')).getByText('AA:BB:CC:DD:EE:FF')).toBeInTheDocument();
        expect(within(rowFor('MyNet')).getByText('psk2')).toBeInTheDocument();
        expect(within(rowFor('MyNet')).getByText('Up')).toBeInTheDocument();
    });

    it('falls back to placeholders for a disabled interface missing bssid/encryption', () => {
        renderSection();

        const guestRow = rowFor('Guest');
        expect(within(guestRow).getByText('-')).toBeInTheDocument();
        expect(within(guestRow).getByText('None')).toBeInTheDocument();
        expect(within(guestRow).getByText('Disabled')).toBeInTheDocument();
    });

    it('labels an enabled-but-down radio as Down, distinct from an explicitly disabled radio', () => {
        renderSection({ radio: { ...baseRadio, up: false } });
        expect(screen.getByText('Down')).toBeInTheDocument();
    });

    it('labels a disabled radio as Disabled even if it would otherwise be up', () => {
        // interfaces: [] avoids colliding with a per-interface "Disabled" status badge below.
        renderSection({ radio: { ...baseRadio, disabled: true, up: true, interfaces: [] } });
        expect(screen.getByText('Disabled')).toBeInTheDocument();
    });

    it('clarifies that a down interface is down because its radio is disabled, not its own config', () => {
        renderSection({
            radio: {
                ...baseRadio,
                disabled: true,
                up: false,
                interfaces: [
                    { section: 'wifinet0', ifname: 'wlan0', ssid: 'MyNet', mode: 'ap', bssid: null, encryption: 'psk2', disabled: false, up: false },
                ],
            },
        });

        expect(within(rowFor('MyNet')).getByText('Down (radio disabled)')).toBeInTheDocument();
    });

    it('shows a plain Down for an interface that is down while its own radio is up', () => {
        renderSection({
            radio: {
                ...baseRadio,
                disabled: false,
                up: true,
                interfaces: [
                    { section: 'wifinet0', ifname: 'wlan0', ssid: 'MyNet', mode: 'ap', bssid: null, encryption: 'psk2', disabled: false, up: false },
                ],
            },
        });

        expect(within(rowFor('MyNet')).getByText('Down')).toBeInTheDocument();
        expect(within(rowFor('MyNet')).queryByText('Down (radio disabled)')).not.toBeInTheDocument();
    });

    it('shows the empty-state row only when there are no interfaces and no interface is pending', () => {
        renderSection({ radio: { ...baseRadio, interfaces: [] } });
        expect(screen.getByText('No interfaces configured')).toBeInTheDocument();
    });

    it('replaces the checked interface row with a skeleton, leaving the other row untouched', () => {
        renderSection({ checkingRadio: 'radio0', checkingSection: 'wifinet0' });

        expect(screen.queryByText('MyNet')).not.toBeInTheDocument();
        expect(screen.getByText('Guest')).toBeInTheDocument();
        expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
    });

    it('appends an extra skeleton row for a brand-new interface instead of swapping an existing one', () => {
        renderSection({ checkingRadio: 'radio0', checkingSection: 'wifinet-new' });

        expect(screen.getByText('MyNet')).toBeInTheDocument();
        expect(screen.getByText('Guest')).toBeInTheDocument();
        expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
    });

    it('does not show the empty-state row while a brand-new interface is pending on an otherwise empty radio', () => {
        renderSection({ radio: { ...baseRadio, interfaces: [] }, checkingRadio: 'radio0', checkingSection: 'wifinet-new' });

        expect(screen.queryByText('No interfaces configured')).not.toBeInTheDocument();
        expect(document.querySelectorAll('tbody tr')).toHaveLength(1);
    });

    it('ignores a pending check addressed to a different radio', () => {
        renderSection({ checkingRadio: 'radio1', checkingSection: 'wifinet0' });

        expect(screen.getByText('MyNet')).toBeInTheDocument();
        expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
    });

    it('asks for confirmation before removing an interface, and only removes it once confirmed', () => {
        renderSection();

        fireEvent.click(within(rowFor('MyNet')).getByRole('button', { name: 'Remove' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(removeInterface).not.toHaveBeenCalled();

        fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm' }));
        expect(removeInterface).toHaveBeenCalledWith({ section: 'wifinet0' });
    });

    it('toggles by inverting the interface\'s current disabled flag', () => {
        renderSection();

        fireEvent.click(within(rowFor('MyNet')).getByRole('button', { name: 'Disable' }));
        expect(toggleInterface).toHaveBeenCalledWith({ section: 'wifinet0', disabled: true });

        fireEvent.click(within(rowFor('Guest')).getByRole('button', { name: 'Enable' }));
        expect(toggleInterface).toHaveBeenCalledWith({ section: 'wifinet1', disabled: false });
    });

    it('disables every row action while a remove or toggle mutation is in flight', () => {
        useToggleInterface.mockReturnValue({ mutate: toggleInterface, isPending: true });
        renderSection();

        const row = rowFor('MyNet');
        expect(within(row).getByRole('button', { name: 'Edit' })).toBeDisabled();
        expect(within(row).getByRole('button', { name: 'Disable' })).toBeDisabled();
        expect(within(row).getByRole('button', { name: 'Remove' })).toBeDisabled();
    });

    it('disables row actions for an interface with no UCI section even when nothing is busy', () => {
        renderSection({ radio: { ...baseRadio, interfaces: [{ ...baseRadio.interfaces[0], section: '' }] } });

        const row = rowFor('MyNet');
        expect(within(row).getByRole('button', { name: 'Edit' })).toBeDisabled();
        expect(within(row).getByRole('button', { name: 'Remove' })).toBeDisabled();
    });
});
