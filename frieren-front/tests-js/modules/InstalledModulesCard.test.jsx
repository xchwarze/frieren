/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `wouter`'s `useLocation` is used directly (no feature wrapper hook), so it is mocked at the
 * module boundary via `vi.hoisted` to get a stable spy reference despite `vi.mock` hoisting.
 * `selectedInstalledModuleAtom` is a real jotai atom read back through a per-test `store`.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import InstalledModulesCard from '@src/features/modules/components/InstalledModulesCard/index.jsx';
import selectedInstalledModuleAtom from '@src/features/modules/atoms/selectedInstalledModuleAtom.js';
import usePinModule from '@src/features/modules/hooks/usePinModule.js';

vi.mock('@src/features/modules/hooks/usePinModule.js', () => ({ default: vi.fn() }));

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock('wouter', () => ({ useLocation: () => ['/modules', navigateMock] }));

const systemModule = {
    name: 'dashboard', title: 'Dashboard', icon: 'home', description: 'Core dashboard',
    author: 'DSR!', version: '1.0.0', size: '10 KB', repository: 'https://example.com/dashboard',
    system: true, sidebar: true, forceSidebar: true,
};

const unpinnedModule = {
    name: 'evilportal', title: 'Evil Portal', icon: 'radio', description: 'Captive portal',
    author: 'DSR!', version: '1.2.0', size: '128 KB', repository: 'https://example.com/evilportal',
    documentation: 'https://example.com/evilportal/docs', system: false, sidebar: false, forceSidebar: false,
};

const pinnedModule = {
    name: 'mdk4', title: 'MDK4', icon: 'wifi', description: 'Wifi jammer',
    author: 'DSR!', version: '2.0.0', size: '64 KB', repository: 'https://example.com/mdk4',
    system: false, sidebar: true, forceSidebar: false,
};

const forcedModule = {
    name: 'terminal', title: 'Terminal', icon: 'terminal', description: 'Web terminal',
    author: 'DSR!', version: '1.0.0', size: '5 KB', repository: 'https://example.com/terminal',
    system: false, sidebar: true, forceSidebar: true,
};

const pinMutation = vi.fn();

const renderCard = ({ installedQuery, store = createStore() }) => {
    const utils = render(
        <Provider store={store}>
            <InstalledModulesCard installedQuery={installedQuery} />
        </Provider>
    );

    return { ...utils, store };
};

const rowFor = (title) => screen.getByText(title).closest('tr');

describe('InstalledModulesCard', () => {
    beforeEach(() => {
        navigateMock.mockReset();
        pinMutation.mockReset();
        usePinModule.mockReturnValue({ mutate: pinMutation, isPending: false });
    });

    it('shows a loading skeleton while the query is loading', () => {
        renderCard({ installedQuery: { data: undefined, isSuccess: false, isLoading: true, isFetching: true, refetch: vi.fn() } });

        expect(screen.queryByText('There are no modules installed yet.')).not.toBeInTheDocument();
        expect(document.querySelector('table[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('shows an empty-state row when no modules are installed', () => {
        renderCard({ installedQuery: { data: [], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        expect(screen.getByText('There are no modules installed yet.')).toBeInTheDocument();
    });

    it('renders a system module without launch, pin or remove actions', () => {
        renderCard({ installedQuery: { data: [systemModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        const row = rowFor('Dashboard');
        expect(within(row).queryByRole('button', { name: /Dashboard/ })).not.toBeInTheDocument();
        expect(within(row).queryByRole('button', { name: 'Pin' })).not.toBeInTheDocument();
        expect(within(row).queryByRole('button', { name: 'Unpin' })).not.toBeInTheDocument();
        expect(within(row).queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Open repository' })).toBeInTheDocument();
    });

    it('navigates to the module route when a non-system module is launched', () => {
        renderCard({ installedQuery: { data: [unpinnedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        fireEvent.click(within(rowFor('Evil Portal')).getByRole('button', { name: /Evil Portal/ }));

        expect(navigateMock).toHaveBeenCalledWith('/evilportal');
    });

    it('offers to pin an unpinned module and reports the pin action', () => {
        renderCard({ installedQuery: { data: [unpinnedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        fireEvent.click(within(rowFor('Evil Portal')).getByRole('button', { name: 'Pin' }));

        expect(pinMutation).toHaveBeenCalledWith({ moduleTitle: 'Evil Portal', moduleName: 'evilportal', status: 'pin' });
    });

    it('offers to unpin an already pinned module and reports the unpin action', () => {
        renderCard({ installedQuery: { data: [pinnedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        fireEvent.click(within(rowFor('MDK4')).getByRole('button', { name: 'Unpin' }));

        expect(pinMutation).toHaveBeenCalledWith({ moduleTitle: 'MDK4', moduleName: 'mdk4', status: 'unpin' });
    });

    it('hides the pin action but keeps launch/remove for a forceSidebar module', () => {
        renderCard({ installedQuery: { data: [forcedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        const row = rowFor('Terminal');
        expect(within(row).queryByRole('button', { name: 'Pin' })).not.toBeInTheDocument();
        expect(within(row).queryByRole('button', { name: 'Unpin' })).not.toBeInTheDocument();
        expect(within(row).getByRole('button', { name: /Terminal/ })).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('sets the selected-installed-module atom to the clicked module on remove', () => {
        const { store } = renderCard({ installedQuery: { data: [unpinnedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        fireEvent.click(within(rowFor('Evil Portal')).getByRole('button', { name: 'Remove' }));

        expect(store.get(selectedInstalledModuleAtom)).toEqual(unpinnedModule);
    });

    it('shows the documentation button only for modules that provide one', () => {
        renderCard({ installedQuery: { data: [unpinnedModule, pinnedModule], isSuccess: true, isLoading: false, isFetching: false, refetch: vi.fn() } });

        expect(within(rowFor('Evil Portal')).getByRole('button', { name: 'Open documentation' })).toBeInTheDocument();
        expect(within(rowFor('MDK4')).queryByRole('button', { name: 'Open documentation' })).not.toBeInTheDocument();
    });
});
