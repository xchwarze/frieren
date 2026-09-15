/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The success toast wording flips on the `enabled` boolean (`enabled on boot` vs `disabled on
 * boot`) — pinned in both directions here so inverting that ternary in the hook fails a test.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useToggleEnabled from '@src/features/system/hooks/useToggleEnabled.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SYSTEM_GET_SERVICES } from '@src/features/system/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseToggleEnabled = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useToggleEnabled(), { wrapper }), queryClient };
};

describe('useToggleEnabled', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('sends the service name and the desired enabled state', async () => {
        const { result } = renderUseToggleEnabled();

        await result.current.mutateAsync({ name: 'dropbear', enabled: true });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'system',
            action: 'toggleEnabled',
            name: 'dropbear',
            enabled: true,
        });
    });

    it('toasts "enabled on boot" when enabling', async () => {
        const { result } = renderUseToggleEnabled();

        await result.current.mutateAsync({ name: 'dropbear', enabled: true });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('dropbear enabled on boot'));
    });

    it('toasts "disabled on boot" when disabling', async () => {
        const { result } = renderUseToggleEnabled();

        await result.current.mutateAsync({ name: 'dropbear', enabled: false });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('dropbear disabled on boot'));
    });

    it('invalidates the services list on success', async () => {
        const { result, queryClient } = renderUseToggleEnabled();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ name: 'dropbear', enabled: true });

        await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [SYSTEM_GET_SERVICES] }));
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseToggleEnabled();

        await expect(result.current.mutateAsync({ name: 'dropbear', enabled: true })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to change boot state'));
    });
});
