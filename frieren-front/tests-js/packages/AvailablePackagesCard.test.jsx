/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `isBusy` is an OR across flags from two independent hooks (useAvailablePackages'
 * isPolling/isPending and useUpdateLists' isPolling/isPending). A regression that checks
 * only one hook's flags would still pass a naive "loading" test, so the busy-state cases
 * below toggle each source independently.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import AvailablePackagesCard from '@src/features/packages/components/AvailablePackagesCard/index.jsx';
import useAvailablePackages from '@src/features/packages/hooks/useAvailablePackages.js';
import useUpdateLists from '@src/features/packages/hooks/useUpdateLists.js';
import useInstallPackage from '@src/features/packages/hooks/useInstallPackage.js';
import availablePackagesAtom from '@src/features/packages/atoms/availablePackagesAtom.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';

vi.mock('@src/features/packages/hooks/useAvailablePackages.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/packages/hooks/useUpdateLists.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/packages/hooks/useInstallPackage.js', () => ({ default: vi.fn() }));

const store = getDefaultStore();

const loadAvailable = vi.fn();
const update = vi.fn();
const install = vi.fn();

const idleAvailable = { load: loadAvailable, isPolling: false, isLoaded: false, isPending: false };
const idleUpdate = { update, isPolling: false, isPending: false };
const idleInstall = { install, isPolling: false, installingName: '' };

describe('AvailablePackagesCard', () => {
    beforeEach(() => {
        store.set(availablePackagesAtom, []);
        store.set(installedPackagesAtom, []);
        loadAvailable.mockReset();
        update.mockReset();
        install.mockReset();
        useAvailablePackages.mockReturnValue(idleAvailable);
        useUpdateLists.mockReturnValue(idleUpdate);
        useInstallPackage.mockReturnValue(idleInstall);
    });

    it('prompts to update lists before any packages have ever loaded, and wires the click through', () => {
        render(<AvailablePackagesCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Update Lists' }));

        expect(update).toHaveBeenCalledTimes(1);
    });

    it('shows the busy skeleton, not the update prompt, while useAvailablePackages alone is polling', () => {
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isPolling: true });

        render(<AvailablePackagesCard />);

        expect(screen.queryByRole('button', { name: 'Update Lists' })).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Search available packages...')).not.toBeInTheDocument();
    });

    it('shows the busy skeleton, not the update prompt, while useUpdateLists alone is pending', () => {
        useUpdateLists.mockReturnValue({ ...idleUpdate, isPending: true });

        render(<AvailablePackagesCard />);

        expect(screen.queryByRole('button', { name: 'Update Lists' })).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Search available packages...')).not.toBeInTheDocument();
    });

    it('renders loaded packages, hiding the install action for ones already installed', () => {
        store.set(availablePackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever' },
        ]);
        store.set(installedPackagesAtom, [{ name: 'curl', version: '8.4.0', description: '' }]);
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isLoaded: true });

        render(<AvailablePackagesCard />);

        const curlRow = screen.getByText('curl').closest('tr');
        const wgetRow = screen.getByText('wget').closest('tr');
        expect(within(curlRow).queryByRole('button', { name: 'Install package' })).not.toBeInTheDocument();
        expect(within(wgetRow).getByRole('button', { name: 'Install package' })).toBeInTheDocument();
    });

    it('filters the loaded list by name or description, debounced', async () => {
        store.set(availablePackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever tool' },
        ]);
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isLoaded: true });

        render(<AvailablePackagesCard />);

        fireEvent.change(screen.getByPlaceholderText('Search available packages...'), { target: { value: 'retriever' } });

        await waitFor(() => expect(screen.queryByText('curl')).not.toBeInTheDocument());
        expect(screen.getByText('wget')).toBeInTheDocument();
    });

    it('calls install with only the clicked package name', () => {
        store.set(availablePackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever' },
        ]);
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isLoaded: true });

        render(<AvailablePackagesCard />);

        fireEvent.click(within(screen.getByText('wget').closest('tr')).getByRole('button', { name: 'Install package' }));

        expect(install).toHaveBeenCalledWith({ packageName: 'wget' });
    });

    it('disables every install action while one install is in flight, but only spins the matching row', () => {
        store.set(availablePackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever' },
        ]);
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isLoaded: true });
        useInstallPackage.mockReturnValue({ install, isPolling: true, installingName: 'wget' });

        render(<AvailablePackagesCard />);

        const curlButton = within(screen.getByText('curl').closest('tr')).getByRole('button', { name: 'Install package' });
        const wgetButton = within(screen.getByText('wget').closest('tr')).getByRole('button', { name: 'Install package' });

        expect(curlButton).toBeDisabled();
        expect(wgetButton).toBeDisabled();
        expect(curlButton.querySelector('.icon-loader')).not.toBeInTheDocument();
        expect(wgetButton.querySelector('.icon-loader')).toBeInTheDocument();
    });

    it('shows "no packages found" when loaded but empty', () => {
        useAvailablePackages.mockReturnValue({ ...idleAvailable, isLoaded: true });

        render(<AvailablePackagesCard />);

        expect(screen.getByText('No packages found.')).toBeInTheDocument();
    });

    it('reloads the available list once an update completes, via the onCompleted forwarded to useUpdateLists', () => {
        render(<AvailablePackagesCard />);

        const { onCompleted } = useUpdateLists.mock.calls.at(-1)[0];
        onCompleted();

        expect(loadAvailable).toHaveBeenCalledTimes(1);
    });
});
