/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The hook forwards the caller's `action: 'up'|'down'` under the wire's `state` param,
 * because the backend routes on `action` itself (set to the fixed 'toggleInterface'
 * endpoint name) — a comment in the source flags this as deliberate and easy to get
 * backwards, so it is pinned here directly against the mocked `fetchPost` call.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useToggleInterface from '@src/features/network/hooks/useToggleInterface.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@src/helpers/actionsHelper.js', () => ({ sleep: vi.fn().mockResolvedValue(undefined) }));

const renderUseToggleInterface = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useToggleInterface(), { wrapper }), queryClient };
};

describe('useToggleInterface', () => {
    beforeEach(async () => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
        const { sleep } = await import('@src/helpers/actionsHelper.js');
        sleep.mockClear();
    });

    it('sends the action under `state`, keeping `action` fixed as the endpoint name', async () => {
        const { result } = renderUseToggleInterface();

        await result.current.mutateAsync({ name: 'wlan0', action: 'up' });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'network',
            action: 'toggleInterface',
            name: 'wlan0',
            state: 'up',
        });
    });

    it('sends state "down" when bringing an interface down', async () => {
        const { result } = renderUseToggleInterface();

        await result.current.mutateAsync({ name: 'wlan0', action: 'down' });

        expect(fetchPost).toHaveBeenCalledWith(expect.objectContaining({ state: 'down' }));
    });

    it('waits 1.5s before invalidating, so the backend has time to apply the toggle', async () => {
        const { result, queryClient } = renderUseToggleInterface();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        const { sleep } = await import('@src/helpers/actionsHelper.js');

        await result.current.mutateAsync({ name: 'wlan0', action: 'up' });

        expect(sleep).toHaveBeenCalledWith(1500);
        await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [NETWORK_GET_INTERFACES] }));
    });

    it('toasts success naming the interface and the direction it was brought', async () => {
        const { result } = renderUseToggleInterface();

        await result.current.mutateAsync({ name: 'wlan0', action: 'down' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('wlan0 brought down'));
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseToggleInterface();

        await expect(result.current.mutateAsync({ name: 'wlan0', action: 'up' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to toggle interface'));
    });
});
