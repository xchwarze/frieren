/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `ServicesCard` used to decide which services deserve a "this can lock you out"
 * confirmation from a hardcoded name list (network/dropbear/uhttpd/firewall), so a build
 * shipping openssh, nginx or nftables got no warning before the operator cut their own
 * access. The gate now reads the `critical` flag the `system` module's getServices action
 * computes. The fixtures below deliberately invert that old list — a critical `sshd` (never
 * in it) next to a non-critical `firewall` (always in it) — so a regression back to name
 * matching fails in both directions.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import ServicesCard from '@src/features/system/components/ServicesCard/index.jsx';
import useGetServices from '@src/features/system/hooks/useGetServices.js';
import useControlService from '@src/features/system/hooks/useControlService.js';
import useToggleEnabled from '@src/features/system/hooks/useToggleEnabled.js';

vi.mock('@src/features/system/hooks/useGetServices.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/system/hooks/useControlService.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/system/hooks/useToggleEnabled.js', () => ({ default: vi.fn() }));

const services = [
    { name: 'sshd', enabled: true, running: true, critical: true },
    { name: 'firewall', enabled: true, running: true, critical: false },
];

const controlMutation = vi.fn();
const toggleMutation = vi.fn();

const rowFor = (name) => screen.getByText(name).closest('tr');

const clickAction = (name, action) => fireEvent.click(within(rowFor(name)).getByRole('button', { name: action }));

const confirmationModal = () => screen.queryByRole('dialog');

describe('ServicesCard', () => {
    beforeEach(() => {
        controlMutation.mockReset().mockResolvedValue({});
        toggleMutation.mockReset().mockResolvedValue({});
        useGetServices.mockReturnValue({
            data: { services },
            isSuccess: true,
            isFetching: false,
            refetch: vi.fn(),
        });
        useControlService.mockReturnValue({ mutateAsync: controlMutation });
        useToggleEnabled.mockReturnValue({ mutateAsync: toggleMutation });
    });

    it('marks services critical from the backend flag, not from a local name list', () => {
        render(<ServicesCard />);

        expect(within(rowFor('sshd')).getByText('critical')).toBeInTheDocument();
        expect(within(rowFor('firewall')).queryByText('critical')).not.toBeInTheDocument();
    });

    it('asks for confirmation before stopping a flagged service the old hardcoded list never covered', () => {
        render(<ServicesCard />);

        clickAction('sshd', 'Stop');

        expect(confirmationModal()).toBeInTheDocument();
        expect(within(confirmationModal()).getByText('sshd')).toBeInTheDocument();
        expect(controlMutation).not.toHaveBeenCalled();
    });

    it('stops an unflagged service immediately even when its name is in the old hardcoded list', async () => {
        render(<ServicesCard />);

        clickAction('firewall', 'Stop');

        expect(confirmationModal()).not.toBeInTheDocument();
        await waitFor(() => expect(controlMutation).toHaveBeenCalledWith({ name: 'firewall', command: 'stop' }));
    });

    it('does not gate a non-disruptive start on a flagged service', async () => {
        render(<ServicesCard />);

        clickAction('sshd', 'Start');

        expect(confirmationModal()).not.toBeInTheDocument();
        await waitFor(() => expect(controlMutation).toHaveBeenCalledWith({ name: 'sshd', command: 'start' }));
    });

    it('runs the pending boot-disable of a flagged service only after confirmation', async () => {
        render(<ServicesCard />);

        fireEvent.click(screen.getByLabelText('Toggle sshd on boot'));

        expect(toggleMutation).not.toHaveBeenCalled();
        fireEvent.click(within(confirmationModal()).getByRole('button', { name: 'Confirm' }));

        await waitFor(() => expect(toggleMutation).toHaveBeenCalledWith({ name: 'sshd', enabled: false }));
    });
});
