/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The success toast wording depends on `variables.status` ('pin' vs 'unpin'), and both the
 * module list and installed-modules queries get invalidated on every success — pinned here so
 * swapping the pin/unpin branches or dropping either invalidation fails a test.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import usePinModule from '@src/features/modules/hooks/usePinModule.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUsePinModule = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => usePinModule(), { wrapper }), queryClient };
};

describe('usePinModule', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
    });

    it('sends the module name and desired pin status', async () => {
        const { result } = renderUsePinModule();

        await result.current.mutateAsync({ moduleName: 'demo', status: 'pin', moduleTitle: 'Demo' });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'modules',
            action: 'pinModule',
            moduleName: 'demo',
            status: 'pin',
        });
    });

    it('toasts "added to the sidebar" when pinning', async () => {
        const { result } = renderUsePinModule();

        await result.current.mutateAsync({ moduleName: 'demo', status: 'pin', moduleTitle: 'Demo' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('The Demo module was added to the sidebar'));
    });

    it('toasts "removed from the sidebar" when unpinning', async () => {
        const { result } = renderUsePinModule();

        await result.current.mutateAsync({ moduleName: 'demo', status: 'unpin', moduleTitle: 'Demo' });

        await waitFor(() => (
            expect(toast.success).toHaveBeenCalledWith('The Demo module was removed from the sidebar')
        ));
    });

    it('invalidates both the module list and installed-modules queries on success', async () => {
        const { result, queryClient } = renderUsePinModule();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ moduleName: 'demo', status: 'pin', moduleTitle: 'Demo' });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [MODULES_GET_MODULE_LIST] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [MODULES_GET_INSTALLED_MODULES] });
        });
    });
});
