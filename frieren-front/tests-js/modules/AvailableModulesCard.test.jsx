/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `installModuleAtom` is a real jotai atom (no wrapping hook), so each test mounts its own
 * `Provider store={createStore()}` to stay isolated from other tests and reads the write
 * back via `store.get()` instead of a probe component.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import AvailableModulesCard from '@src/features/modules/components/AvailableModulesCard/index.jsx';
import { installModuleAtom } from '@src/features/modules/atoms/installModuleAtom.js';

const evilPortal = {
    name: 'evilportal',
    title: 'Evil Portal',
    description: 'Captive portal attack',
    author: 'DSR!',
    version: '1.2.0',
    sizeHuman: '128 KB',
    repository: 'https://example.com/evilportal',
    documentation: 'https://example.com/evilportal/docs',
};

const mdk4 = {
    name: 'mdk4',
    title: 'MDK4',
    description: 'Wifi jammer',
    author: 'DSR!',
    version: '2.0.0',
    sizeHuman: '64 KB',
    repository: 'https://example.com/mdk4',
};

const renderCard = ({ availableQuery, installedQuery = { data: [] }, store = createStore() }) => {
    const utils = render(
        <Provider store={store}>
            <AvailableModulesCard availableQuery={availableQuery} installedQuery={installedQuery} />
        </Provider>
    );

    return { ...utils, store };
};

const rowFor = (title) => screen.getByText(title).closest('tr');

describe('AvailableModulesCard', () => {
    it('offers a "Get Modules" button before the first fetch, wired to refetch', () => {
        const refetch = vi.fn();
        renderCard({ availableQuery: { data: undefined, isSuccess: false, isFetching: false, refetch } });

        fireEvent.click(screen.getByRole('button', { name: 'Get Modules' }));

        expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('shows a loading skeleton, not the search/table, while the first fetch is in flight', () => {
        renderCard({ availableQuery: { data: undefined, isSuccess: false, isFetching: true, refetch: vi.fn() } });

        expect(screen.queryByPlaceholderText('Search available modules...')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Get Modules' })).not.toBeInTheDocument();
        expect(document.querySelector('table[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('lists fetched modules sorted by name with a download action for uninstalled ones', () => {
        renderCard({
            availableQuery: { data: [mdk4, evilPortal], isSuccess: true, isFetching: false, refetch: vi.fn() },
        });

        const titles = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);
        expect(titles).toEqual(['Evil Portal', 'MDK4']);
        expect(within(rowFor('Evil Portal')).getByRole('button', { name: 'Download module' })).toBeInTheDocument();
        expect(within(rowFor('MDK4')).getByRole('button', { name: 'Download module' })).toBeInTheDocument();
    });

    it('shows an update action instead of download for an installed module at a different version', () => {
        renderCard({
            availableQuery: { data: [evilPortal, mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
            installedQuery: { data: [{ name: 'mdk4', version: '1.9.0' }] },
        });

        expect(within(rowFor('MDK4')).queryByRole('button', { name: 'Download module' })).not.toBeInTheDocument();
        expect(within(rowFor('MDK4')).getByRole('button', { name: 'Update module' })).toBeInTheDocument();
        expect(within(rowFor('Evil Portal')).getByRole('button', { name: 'Download module' })).toBeInTheDocument();
    });

    it('hides both download and update actions for an installed module already at the latest version', () => {
        renderCard({
            availableQuery: { data: [mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
            installedQuery: { data: [{ name: 'mdk4', version: '2.0.0' }] },
        });

        expect(within(rowFor('MDK4')).queryByRole('button', { name: 'Download module' })).not.toBeInTheDocument();
        expect(within(rowFor('MDK4')).queryByRole('button', { name: 'Update module' })).not.toBeInTheDocument();
    });

    it('shows the documentation button only for modules that provide one', () => {
        renderCard({
            availableQuery: { data: [evilPortal, mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
        });

        expect(within(rowFor('Evil Portal')).getByRole('button', { name: 'Open documentation' })).toBeInTheDocument();
        expect(within(rowFor('MDK4')).queryByRole('button', { name: 'Open documentation' })).not.toBeInTheDocument();
    });

    it('filters the list by title or description after the search debounce', async () => {
        renderCard({
            availableQuery: { data: [evilPortal, mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
        });

        fireEvent.change(screen.getByPlaceholderText('Search available modules...'), { target: { value: 'jammer' } });

        await waitFor(() => expect(screen.queryByText('Evil Portal')).not.toBeInTheDocument());
        expect(screen.getByText('MDK4')).toBeInTheDocument();
    });

    it('shows a "No modules found" row when the filter matches nothing', async () => {
        renderCard({
            availableQuery: { data: [evilPortal, mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
        });

        fireEvent.change(screen.getByPlaceholderText('Search available modules...'), { target: { value: 'zzz-no-match' } });

        expect(await screen.findByText('No modules found.')).toBeInTheDocument();
        expect(screen.queryByText('Evil Portal')).not.toBeInTheDocument();
        expect(screen.queryByText('MDK4')).not.toBeInTheDocument();
    });

    it('sets the install atom to the clicked module when Download is clicked', () => {
        const { store } = renderCard({
            availableQuery: { data: [evilPortal], isSuccess: true, isFetching: false, refetch: vi.fn() },
        });

        fireEvent.click(within(rowFor('Evil Portal')).getByRole('button', { name: 'Download module' }));

        expect(store.get(installModuleAtom)).toEqual(evilPortal);
    });

    it('sets the install atom to the clicked module when Update is clicked', () => {
        const { store } = renderCard({
            availableQuery: { data: [mdk4], isSuccess: true, isFetching: false, refetch: vi.fn() },
            installedQuery: { data: [{ name: 'mdk4', version: '1.9.0' }] },
        });

        fireEvent.click(within(rowFor('MDK4')).getByRole('button', { name: 'Update module' }));

        expect(store.get(installModuleAtom)).toEqual(mdk4);
    });
});
