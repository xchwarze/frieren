/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Mirrors useSetInterface.test.jsx: the same dns string/array transform applies to
 * creating an interface, plus the mtu/macaddr/peerdns fields this action also accepts.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAddInterface from '@src/features/network/hooks/useAddInterface.js';
import { fetchPost } from '@src/services/fetchService.js';
import { NETWORK_GET_INTERFACES } from '@src/features/network/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseAddInterface = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useAddInterface(), { wrapper }), queryClient };
};

describe('useAddInterface', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('splits a space/comma separated dns string into an array', async () => {
        const { result } = renderUseAddInterface();

        await result.current.mutateAsync({
            name: 'guest',
            device: 'br-lan',
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: '1.1.1.1, 8.8.8.8',
            mtu: '1500',
            macaddr: 'AA:BB:CC:DD:EE:FF',
            peerdns: false,
        });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'network',
            action: 'addInterface',
            name: 'guest',
            device: 'br-lan',
            proto: 'static',
            ipaddr: '192.168.1.1',
            netmask: '255.255.255.0',
            gateway: '192.168.1.254',
            dns: ['1.1.1.1', '8.8.8.8'],
            mtu: '1500',
            macaddr: 'AA:BB:CC:DD:EE:FF',
            peerdns: false,
        });
    });

    it('sends an empty array for a blank dns string, not an array with an empty entry', async () => {
        const { result } = renderUseAddInterface();

        await result.current.mutateAsync({ name: 'guest', proto: 'dhcp', dns: '' });

        expect(fetchPost).toHaveBeenCalledWith(expect.objectContaining({ dns: [] }));
    });

    it('toasts success naming the interface and invalidates the interfaces list', async () => {
        const { result, queryClient } = renderUseAddInterface();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ name: 'guest', proto: 'dhcp', dns: '' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('guest created'));
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [NETWORK_GET_INTERFACES] });
    });

    it('toasts a generic failure message when the request fails', async () => {
        fetchPost.mockRejectedValue(new Error('boom'));
        const { result } = renderUseAddInterface();

        await expect(result.current.mutateAsync({ name: 'guest', proto: 'dhcp', dns: '' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to create interface'));
    });
});
