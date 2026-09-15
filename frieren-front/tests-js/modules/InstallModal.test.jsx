/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `installModuleAtom` is a real jotai atom driving both visibility and the in-progress
 * destination, so each test mounts its own `Provider store={createStore()}` seeded with the
 * atom's starting value. `window.Frieren.loadingImage` is set manually because the processing
 * state renders the shared `Loading` component, which normally reads it from `umdSupport.js`
 * (only wired up at app startup, not in this unit test). The min-version gate is exercised
 * against the fixed panel version vitest.config.js injects (1.4.1).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import InstallModal from '@src/features/modules/components/InstallModal/index.jsx';
import { installModuleAtom } from '@src/features/modules/atoms/installModuleAtom.js';
import useCheckDestination from '@src/features/modules/hooks/useCheckDestination';
import useDownloadModule from '@src/features/modules/hooks/useDownloadModule';

vi.mock('@src/features/modules/hooks/useCheckDestination', () => ({ default: vi.fn() }));
vi.mock('@src/features/modules/hooks/useDownloadModule', () => ({ default: vi.fn() }));

const evilPortal = {
    name: 'evilportal',
    title: 'Evil Portal',
    author: 'DSR!',
    repository: 'https://example.com/evilportal',
    size: 128000,
};

const checkDestinationMock = vi.fn();
const downloadModuleMock = vi.fn();

const renderModal = (selectedRemoteModule, store = createStore()) => {
    store.set(installModuleAtom, selectedRemoteModule);
    const utils = render(
        <Provider store={store}>
            <InstallModal />
        </Provider>
    );

    return { ...utils, store };
};

describe('InstallModal', () => {
    beforeEach(() => {
        window.Frieren = { loadingImage: 'loading.png' };
        checkDestinationMock.mockReset();
        downloadModuleMock.mockReset();
        useCheckDestination.mockReturnValue({ data: undefined, refetch: checkDestinationMock, isSuccess: false });
        useDownloadModule.mockReturnValue({ mutate: downloadModuleMock });
    });

    it('is hidden when no module is selected', () => {
        renderModal(false);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('checks the install destination as soon as a module is selected', () => {
        renderModal(evilPortal);

        expect(checkDestinationMock).toHaveBeenCalled();
    });

    it('shows install info for a module that meets the minimum panel version', () => {
        renderModal(evilPortal);

        expect(screen.getByText('Install Module Evil Portal')).toBeInTheDocument();
        expect(screen.getByText(/developed by:/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'following link' })).toHaveAttribute('href', evilPortal.repository);
    });

    it('shows the update title when updating an already-installed module', () => {
        renderModal({ ...evilPortal, updating: true });

        expect(screen.getByText('Update Module Evil Portal')).toBeInTheDocument();
    });

    it('blocks installation with a version warning when the panel is too old, hiding the install info and actions', () => {
        renderModal({ ...evilPortal, minPanelVersion: '9.9.9' });

        expect(screen.getByText(/requires panel version/)).toBeInTheDocument();
        expect(screen.getByText('9.9.9')).toBeInTheDocument();
        expect(screen.getByText('1.4.1')).toBeInTheDocument();
        expect(screen.queryByText(/developed by:/)).not.toBeInTheDocument();
        expect(document.querySelector('.spinner-border')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Install/ })).not.toBeInTheDocument();
    });

    it('shows a footer spinner while the destination check is still pending', () => {
        renderModal(evilPortal);

        expect(document.querySelector('.spinner-border')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Install/ })).not.toBeInTheDocument();
    });

    it('offers both destinations once the check succeeds and both are available', () => {
        useCheckDestination.mockReturnValue({
            data: { isInternalAvailable: true, isSDAvailable: true },
            refetch: checkDestinationMock,
            isSuccess: true,
        });
        renderModal(evilPortal);

        expect(screen.getByRole('button', { name: 'Install to SD Card' })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: 'Install Internally' })).not.toBeDisabled();
    });

    it('hides the SD card option when SD storage is unavailable', () => {
        useCheckDestination.mockReturnValue({
            data: { isInternalAvailable: true, isSDAvailable: false },
            refetch: checkDestinationMock,
            isSuccess: true,
        });
        renderModal(evilPortal);

        expect(screen.queryByRole('button', { name: 'Install to SD Card' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Install Internally' })).not.toBeDisabled();
    });

    it('disables the internal option when internal storage is unavailable', () => {
        useCheckDestination.mockReturnValue({
            data: { isInternalAvailable: false, isSDAvailable: true },
            refetch: checkDestinationMock,
            isSuccess: true,
        });
        renderModal(evilPortal);

        expect(screen.getByRole('button', { name: 'Install Internally' })).toBeDisabled();
    });

    it('starts the download for the chosen destination and switches to the progress view', () => {
        useCheckDestination.mockReturnValue({
            data: { isInternalAvailable: true, isSDAvailable: true },
            refetch: checkDestinationMock,
            isSuccess: true,
        });
        const { store } = renderModal(evilPortal);

        fireEvent.click(screen.getByRole('button', { name: 'Install to SD Card' }));

        expect(downloadModuleMock).toHaveBeenCalledTimes(1);
        expect(store.get(installModuleAtom).destination).toBe('sd');
        expect(screen.getByText('Downloading and installing...')).toBeInTheDocument();
        expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
    });

    it('closes without starting a download when the close button is clicked', async () => {
        const { store } = renderModal(evilPortal);

        fireEvent.click(screen.getByLabelText('Close'));

        expect(downloadModuleMock).not.toHaveBeenCalled();
        expect(store.get(installModuleAtom)).toBe(false);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
});
