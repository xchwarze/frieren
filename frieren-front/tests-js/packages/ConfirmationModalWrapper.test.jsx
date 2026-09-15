/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `autoremove` is local component state, reset on close alongside `selectedPackageAtom` — a
 * missed reset would silently carry a checked switch into the next, unrelated removal. The
 * "cancel resets" case below re-opens the modal to prove the switch actually comes back
 * unchecked, instead of just trusting the close handler ran.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import ConfirmationModalWrapper from '@src/features/packages/components/ConfirmationModalWrapper/index.jsx';
import selectedPackageAtom from '@src/features/packages/atoms/selectedPackageAtom.js';
import useRemovePackage from '@src/features/packages/hooks/useRemovePackage.js';

vi.mock('@src/features/packages/hooks/useRemovePackage.js', () => ({ default: vi.fn() }));

const store = getDefaultStore();
const remove = vi.fn();

describe('ConfirmationModalWrapper', () => {
    beforeEach(() => {
        store.set(selectedPackageAtom, false);
        remove.mockReset();
        useRemovePackage.mockReturnValue({ remove });
    });

    it('stays closed when no package is selected', () => {
        render(<ConfirmationModalWrapper />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens with the selected package name in the confirmation text', () => {
        store.set(selectedPackageAtom, { name: 'curl' });

        render(<ConfirmationModalWrapper />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('curl')).toBeInTheDocument();
    });

    it('confirms with autoremove false by default and clears the selection', () => {
        store.set(selectedPackageAtom, { name: 'curl' });

        render(<ConfirmationModalWrapper />);
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(remove).toHaveBeenCalledWith({ packageName: 'curl', autoremove: false });
        expect(store.get(selectedPackageAtom)).toBe(false);
    });

    it('confirms with autoremove true once the switch is toggled on', () => {
        store.set(selectedPackageAtom, { name: 'curl' });

        render(<ConfirmationModalWrapper />);
        fireEvent.click(screen.getByLabelText('Also remove unused dependencies'));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(remove).toHaveBeenCalledWith({ packageName: 'curl', autoremove: true });
    });

    it('resets the autoremove switch when cancelled, instead of carrying it into the next removal', () => {
        store.set(selectedPackageAtom, { name: 'curl' });
        const { rerender } = render(<ConfirmationModalWrapper />);

        fireEvent.click(screen.getByLabelText('Also remove unused dependencies'));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(store.get(selectedPackageAtom)).toBe(false);

        act(() => store.set(selectedPackageAtom, { name: 'wget' }));
        rerender(<ConfirmationModalWrapper />);

        expect(screen.getByLabelText('Also remove unused dependencies')).not.toBeChecked();
    });
});
