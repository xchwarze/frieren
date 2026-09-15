/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Mirrors useDeleteStaticLease.test.jsx's toast/invalidate convention for the
 * network-interface deletion action.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useRemoveInterface from '@src/features/network/hooks/useRemoveInterface.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseRemoveInterface = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useRemoveInterface(), { wrapper }), queryClient };
};

describe('useRemoveInterface', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('sends the interface name to the removeInterface action', async () => {
        const { result } = renderUseRemoveInterface();

        await result.current.mutateAsync({ name: 'guest' });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'network',
            action: 'removeInterface',
            name: 'guest',
        });
    });

    it('toasts success naming the interface and invalidates the interfaces list', async () => {
        const { result, queryClient } = renderUseRemoveInterface();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ name: 'guest' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('guest removed'));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [NETWORK_GET_INTERFACES] });
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseRemoveInterface();

        await expect(result.current.mutateAsync({ name: 'guest' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to remove interface'));
    });
});
