/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `WirelessAdvancedCard` owns two non-obvious bits of logic: it only re-syncs its textarea
 * from the fetched config when the fetched *content string itself* changes (so local edits
 * survive an identical background refetch, but a real reload overwrites them), and it gates
 * "Reset to Defaults" behind a confirmation before calling the mutation. The three wireless
 * hooks are mocked per the project convention; PanelCard/Button/ConfirmationModal are the real,
 * simple, host-owned components.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import WirelessAdvancedCard from '@src/features/wireless/components/WirelessAdvancedCard/index.jsx';
import useGetRawWirelessConfig from '@src/features/wireless/hooks/useGetRawWirelessConfig.js';
import useSetRawWirelessConfig from '@src/features/wireless/hooks/useSetRawWirelessConfig.js';
import useResetWirelessConfig from '@src/features/wireless/hooks/useResetWirelessConfig.js';

vi.mock('@src/features/wireless/hooks/useGetRawWirelessConfig.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useSetRawWirelessConfig.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useResetWirelessConfig.js', () => ({ default: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const refetch = vi.fn();
const saveMutate = vi.fn();
const resetMutate = vi.fn();

const textarea = () => screen.getByRole('textbox');

describe('WirelessAdvancedCard', () => {
    beforeEach(() => {
        toast.success.mockReset();
        saveMutate.mockReset();
        resetMutate.mockReset();
        useGetRawWirelessConfig.mockReturnValue({
            data: { content: 'config wifi-device radio0\n' },
            isFetching: false,
            refetch,
        });
        useSetRawWirelessConfig.mockReturnValue({ mutate: saveMutate, isPending: false });
        useResetWirelessConfig.mockReturnValue({ mutate: resetMutate, isPending: false });
    });

    it('loads the fetched raw config into the textarea', () => {
        render(<WirelessAdvancedCard />);
        expect(textarea()).toHaveValue('config wifi-device radio0\n');
    });

    it('keeps local edits across a background refetch that returns the same content', () => {
        const { rerender } = render(<WirelessAdvancedCard />);

        fireEvent.change(textarea(), { target: { value: 'edited by user' } });

        useGetRawWirelessConfig.mockReturnValue({
            data: { content: 'config wifi-device radio0\n' },
            isFetching: false,
            refetch,
        });
        rerender(<WirelessAdvancedCard />);

        expect(textarea()).toHaveValue('edited by user');
    });

    it('overwrites local edits once the fetched content itself actually changes (e.g. after a reload)', () => {
        const { rerender } = render(<WirelessAdvancedCard />);

        fireEvent.change(textarea(), { target: { value: 'edited by user' } });

        useGetRawWirelessConfig.mockReturnValue({
            data: { content: 'config wifi-device radio0\n\tnew line\n' },
            isFetching: false,
            refetch,
        });
        rerender(<WirelessAdvancedCard />);

        expect(textarea()).toHaveValue('config wifi-device radio0\n\tnew line\n');
    });

    it('sends the current textarea content to the save mutation and toasts on success', () => {
        saveMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());
        render(<WirelessAdvancedCard />);

        fireEvent.change(textarea(), { target: { value: 'option ssid \'test\'' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save & Reload' }));

        expect(saveMutate).toHaveBeenCalledWith({ content: 'option ssid \'test\'' }, expect.any(Object));
        expect(toast.success).toHaveBeenCalledWith('Wireless config saved and reloaded');
    });

    it('does not reset until the confirmation is accepted, then resets and closes the modal', async () => {
        resetMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());
        render(<WirelessAdvancedCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Reset to Defaults' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(resetMutate).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(resetMutate).toHaveBeenCalledWith(undefined, expect.any(Object));
        expect(toast.success).toHaveBeenCalledWith('Wireless config reset to defaults');
        // react-bootstrap's Modal unmounts only after its exit transition timeout, not synchronously.
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('disables the textarea, both actions, and the refresh button while any operation is busy, without spinning the save/reset icons for a plain fetch', () => {
        useGetRawWirelessConfig.mockReturnValue({
            data: { content: 'config wifi-device radio0\n' },
            isFetching: true,
            refetch,
        });
        render(<WirelessAdvancedCard />);

        expect(textarea()).toBeDisabled();
        const saveButton = screen.getByRole('button', { name: 'Save & Reload' });
        const resetButton = screen.getByRole('button', { name: 'Reset to Defaults' });
        expect(saveButton).toBeDisabled();
        expect(resetButton).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();

        // isFetching alone (not isSaving/isResetting) must not put the action buttons in their spinner state.
        expect(saveButton.querySelector('.icon-loader')).not.toBeInTheDocument();
        expect(resetButton.querySelector('.icon-loader')).not.toBeInTheDocument();
    });

    it('shows the save button in its loading state while the save mutation is pending', () => {
        useSetRawWirelessConfig.mockReturnValue({ mutate: saveMutate, isPending: true });
        render(<WirelessAdvancedCard />);

        expect(screen.getByRole('button', { name: 'Save & Reload' }).querySelector('.icon-loader')).toBeInTheDocument();
    });
});
