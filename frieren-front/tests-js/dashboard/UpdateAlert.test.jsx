/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * vitest.config.js pins VITE_APP_VERSION to '1.4.1', so a news response reporting that
 * same version must read as "up to date" (no card at all) while a different version must
 * surface the update alert — pinning that comparison is the point of the first two cases.
 * SystemStatusModal is mocked: its own restart/reboot polling (timers + fetchPost) is out
 * of scope here — only that UpdateAlert hands it the right `action` after a real update.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import UpdateAlert from '@src/features/dashboard/components/UpdateAlert/index.jsx';
import useNews from '@src/features/dashboard/hooks/useNews.js';
import useSystemUpdate from '@src/features/dashboard/hooks/useSystemUpdate.js';

vi.mock('@src/features/dashboard/hooks/useNews.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/dashboard/hooks/useSystemUpdate.js', () => ({ default: vi.fn() }));
vi.mock('@src/components/SystemStatusModal', () => ({
    default: ({ action }) => (action ? <div data-testid={'system-status-modal'}>{action}</div> : null),
}));

const updateMutate = vi.fn();

describe('UpdateAlert', () => {
    beforeEach(() => {
        updateMutate.mockReset();
        useSystemUpdate.mockReturnValue({ mutate: updateMutate, isPending: false });
    });

    it('renders nothing when the news query has not resolved', () => {
        useNews.mockReturnValue({ isSuccess: false, data: undefined });

        const { container } = render(<UpdateAlert />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when the latest version matches the running app version', () => {
        useNews.mockReturnValue({ isSuccess: true, data: { lastVersion: { version: '1.4.1' } } });

        const { container } = render(<UpdateAlert />);

        expect(container).toBeEmptyDOMElement();
    });

    it('shows the available version and an optional release comment', () => {
        useNews.mockReturnValue({
            isSuccess: true,
            data: { lastVersion: { version: '1.5.0', comment: 'Security fixes' } },
        });

        render(<UpdateAlert />);

        expect(screen.getByText('Latest version: 1.5.0')).toBeInTheDocument();
        expect(screen.getByText(/Security fixes/)).toBeInTheDocument();
    });

    it('hides the update button when the news response carries no updateUrl', () => {
        useNews.mockReturnValue({ isSuccess: true, data: { lastVersion: { version: '1.5.0' } } });

        render(<UpdateAlert />);

        expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
    });

    it('asks for confirmation before starting an update', () => {
        useNews.mockReturnValue({
            isSuccess: true,
            data: { lastVersion: { version: '1.5.0', updateUrl: 'https://example.test/fw.bin' } },
        });

        render(<UpdateAlert />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/version 1\.5\.0/)).toBeInTheDocument();
        expect(updateMutate).not.toHaveBeenCalled();
    });

    it('starts the update with the announced updateUrl once confirmed, and closes the dialog', async () => {
        useNews.mockReturnValue({
            isSuccess: true,
            data: { lastVersion: { version: '1.5.0', updateUrl: 'https://example.test/fw.bin' } },
        });

        render(<UpdateAlert />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        expect(updateMutate).toHaveBeenCalledWith(
            { updateUrl: 'https://example.test/fw.bin' },
            expect.objectContaining({ onSuccess: expect.any(Function) })
        );
        // react-bootstrap unmounts the modal after its exit transition, not synchronously.
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('shows the update status modal only once the mutation reports success, not on a failed start', () => {
        useNews.mockReturnValue({
            isSuccess: true,
            data: { lastVersion: { version: '1.5.0', updateUrl: 'https://example.test/fw.bin' } },
        });

        render(<UpdateAlert />);
        fireEvent.click(screen.getByRole('button', { name: 'Update' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        const { onSuccess } = updateMutate.mock.calls[0][1];

        act(() => onSuccess({ success: false }));
        expect(screen.queryByTestId('system-status-modal')).not.toBeInTheDocument();

        act(() => onSuccess({ success: true }));
        expect(screen.getByTestId('system-status-modal')).toHaveTextContent('update');
    });

    it('shows a disabled, loading Update button while the mutation is pending', () => {
        useSystemUpdate.mockReturnValue({ mutate: updateMutate, isPending: true });
        useNews.mockReturnValue({
            isSuccess: true,
            data: { lastVersion: { version: '1.5.0', updateUrl: 'https://example.test/fw.bin' } },
        });

        render(<UpdateAlert />);

        expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled();
    });
});
