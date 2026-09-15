/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The success toast is built from the mutation variables (`${name} ${command}ed`), and the
 * services list is invalidated by a fixed query key — both pinned directly against the real
 * hook (not a mocked useAuthenticatedMutation) so a renamed key or an inverted/dropped toast
 * branch actually fails a test.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useControlService from '@src/features/system/hooks/useControlService.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_SERVICES } from '@src/features/system/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseControlService = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useControlService(), { wrapper }), queryClient };
};

describe('useControlService', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('sends the service name and command', async () => {
        const { result } = renderUseControlService();

        await result.current.mutateAsync({ name: 'nginx', command: 'start' });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'system',
            action: 'controlService',
            name: 'nginx',
            command: 'start',
        });
    });

    it('toasts a command-specific success message', async () => {
        const { result } = renderUseControlService();

        await result.current.mutateAsync({ name: 'nginx', command: 'restart' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('nginx restarted'));
    });

    it('invalidates the services list on success', async () => {
        const { result, queryClient } = renderUseControlService();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ name: 'nginx', command: 'stop' });

        await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [SYSTEM_GET_SERVICES] }));
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseControlService();

        await expect(result.current.mutateAsync({ name: 'nginx', command: 'start' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to control service'));
    });
});
