/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `removingName` gates every row's remove button (`disabled={!!removingName}`), not just the
 * row being removed — a single in-flight removal must freeze the whole table. The spinner,
 * meanwhile, is scoped to the matching row only. Both sides of that split are asserted below.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import InstalledPackagesCard from '@src/features/packages/components/InstalledPackagesCard/index.jsx';
import useInstalledPackages from '@src/features/packages/hooks/useInstalledPackages.js';
import installedPackagesAtom from '@src/features/packages/atoms/installedPackagesAtom.js';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import removingPackageAtom from '@src/features/packages/atoms/removingPackageAtom.js';

vi.mock('@src/features/packages/hooks/useInstalledPackages.js', () => ({ default: vi.fn() }));

const store = getDefaultStore();

const load = vi.fn();

describe('InstalledPackagesCard', () => {
    beforeEach(() => {
        store.set(installedPackagesAtom, []);
        store.set(selectedPackageAtom, false);
        store.set(removingPackageAtom, '');
        load.mockReset();
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: false });
    });

    it('shows a skeleton, not the search box, while unloaded', () => {
        render(<InstalledPackagesCard />);

        expect(screen.queryByPlaceholderText('Search installed packages...')).not.toBeInTheDocument();
        // SkeletonTable marks its table aria-hidden, so rows must be queried explicitly:
        // 1 header row + 3 default skeleton body rows.
        expect(screen.getAllByRole('row', { hidden: true })).toHaveLength(4);
    });

    it('shows "no packages found" once loaded with an empty list', () => {
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: true });

        render(<InstalledPackagesCard />);

        expect(screen.getByText('No packages found.')).toBeInTheDocument();
    });

    it('filters the loaded list by name or description, debounced', async () => {
        store.set(installedPackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever tool' },
        ]);
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: true });

        render(<InstalledPackagesCard />);

        fireEvent.change(screen.getByPlaceholderText('Search installed packages...'), { target: { value: 'http' } });

        await waitFor(() => expect(screen.queryByText('wget')).not.toBeInTheDocument());
        expect(screen.getByText('curl')).toBeInTheDocument();
    });

    it('selects the package for removal without touching the remove/reload flow directly', () => {
        store.set(installedPackagesAtom, [{ name: 'curl', version: '8.4.0', description: 'HTTP client' }]);
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: true });

        render(<InstalledPackagesCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Remove package' }));

        expect(store.get(selectedPackageAtom)).toEqual({ name: 'curl', version: '8.4.0', description: 'HTTP client' });
    });

    it('freezes every remove button while one package is being removed, spinning only the matching row', () => {
        store.set(installedPackagesAtom, [
            { name: 'curl', version: '8.4.0', description: 'HTTP client' },
            { name: 'wget', version: '1.21', description: 'Retriever' },
        ]);
        store.set(removingPackageAtom, 'wget');
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: true });

        render(<InstalledPackagesCard />);

        const curlButton = within(screen.getByText('curl').closest('tr')).getByRole('button', { name: 'Remove package' });
        const wgetButton = within(screen.getByText('wget').closest('tr')).getByRole('button', { name: 'Remove package' });

        expect(curlButton).toBeDisabled();
        expect(wgetButton).toBeDisabled();
        expect(curlButton.querySelector('.icon-loader')).not.toBeInTheDocument();
        expect(wgetButton.querySelector('.icon-loader')).toBeInTheDocument();
    });

    it('wires the header refresh button to the hook\'s load function', () => {
        useInstalledPackages.mockReturnValue({ load, isPolling: false, isLoaded: true });

        render(<InstalledPackagesCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

        expect(load).toHaveBeenCalledTimes(1);
    });
});
