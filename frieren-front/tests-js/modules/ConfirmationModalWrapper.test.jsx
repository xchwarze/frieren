/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `selectedInstalledModuleAtom` is a real jotai atom that both gates the modal's visibility
 * and carries the module pending removal, so each test seeds a fresh `store` with it and
 * reads it back after interacting to confirm the wrapper resets it.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import ConfirmationModalWrapper from '@src/features/modules/components/ConfirmationModalWrapper/index.jsx';
import selectedInstalledModuleAtom from '@src/features/modules/atoms/selectedInstalledModuleAtom.js';
import useRemoveModule from '@src/features/modules/hooks/useRemoveModule';

vi.mock('@src/features/modules/hooks/useRemoveModule', () => ({ default: vi.fn() }));

const evilPortal = { name: 'evilportal', title: 'Evil Portal' };

const removeModuleMock = vi.fn();

const renderWrapper = (selectedInstalledModule, store = createStore()) => {
    store.set(selectedInstalledModuleAtom, selectedInstalledModule);
    const utils = render(
        <Provider store={store}>
            <ConfirmationModalWrapper />
        </Provider>
    );

    return { ...utils, store };
};

describe('ConfirmationModalWrapper', () => {
    beforeEach(() => {
        removeModuleMock.mockReset();
        useRemoveModule.mockReturnValue({ mutate: removeModuleMock, isPending: false });
    });

    it('is hidden when no module is selected for removal', () => {
        renderWrapper(false);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('names the selected module in the confirmation description', () => {
        renderWrapper(evilPortal);

        expect(screen.getByText(/Evil Portal/)).toBeInTheDocument();
    });

    it('removes the module by name and closes the modal on confirm', () => {
        const { store } = renderWrapper(evilPortal);

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(removeModuleMock).toHaveBeenCalledWith({ moduleName: 'evilportal' });
        expect(store.get(selectedInstalledModuleAtom)).toBe(false);
    });

    it('closes without removing anything on cancel', async () => {
        const { store } = renderWrapper(evilPortal);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(removeModuleMock).not.toHaveBeenCalled();
        expect(store.get(selectedInstalledModuleAtom)).toBe(false);
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('disables cancel and shows the confirm button loading while the removal is pending', () => {
        useRemoveModule.mockReturnValue({ mutate: removeModuleMock, isPending: true });
        renderWrapper(evilPortal);

        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    });
});
