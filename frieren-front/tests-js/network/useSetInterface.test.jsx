/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The backend expects `dns` as an array; the form edits it as a single space/comma
 * separated string. `useSetInterface` owns that conversion, so it is tested directly
 * against `fetchPost` (mocked at the module boundary) rather than through a component.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useSetInterface from '@src/features/network/hooks/useSetInterface.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseSetInterface = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useSetInterface(), { wrapper }), queryClient };
};

describe('useSetInterface', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('splits a space/comma separated dns string into an array', async () => {
        const { result } = renderUseSetInterface();

        await result.current.mutateAsync({
            name: 'wan',
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: '1.1.1.1, 8.8.8.8  9.9.9.9',
        });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'network',
            action: 'setInterface',
            name: 'wan',
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: ['1.1.1.1', '8.8.8.8', '9.9.9.9'],
        });
    });

    it('leaves an already-array dns value untouched', async () => {
        const { result } = renderUseSetInterface();

        await result.current.mutateAsync({ name: 'wan', proto: 'dhcp', dns: ['9.9.9.9'] });

        expect(fetchPost).toHaveBeenCalledWith(expect.objectContaining({ dns: ['9.9.9.9'] }));
    });

    it('sends an empty array for a blank dns string, not an array with an empty entry', async () => {
        const { result } = renderUseSetInterface();

        await result.current.mutateAsync({ name: 'wan', proto: 'dhcp', dns: '   ' });

        expect(fetchPost).toHaveBeenCalledWith(expect.objectContaining({ dns: [] }));
    });

    it('toasts success naming the interface and invalidates the interfaces list', async () => {
        const { result, queryClient } = renderUseSetInterface();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ name: 'lan', proto: 'dhcp', dns: '' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('lan updated'));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [NETWORK_GET_INTERFACES] });
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseSetInterface();

        await expect(result.current.mutateAsync({ name: 'lan', proto: 'dhcp', dns: '' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to update interface'));
    });
});
