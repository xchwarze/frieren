/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The error toast falls back to 'Unknown error' when the rejection has no `message` — pinned
 * both ways here so dropping that `?? 'Unknown error'` fallback fails a test.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useRemoveModule from '@src/features/modules/hooks/useRemoveModule.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderUseRemoveModule = (queryClient = new QueryClient()) => {
    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return { ...renderHook(() => useRemoveModule(), { wrapper }), queryClient };
};

describe('useRemoveModule', () => {
    beforeEach(() => {
        fetchPost.mockReset().mockResolvedValue({});
        toast.success.mockReset();
        toast.error.mockReset();
    });

    it('sends the module name to remove', async () => {
        const { result } = renderUseRemoveModule();

        await result.current.mutateAsync({ moduleName: 'demo' });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'modules',
            action: 'removeModule',
            moduleName: 'demo',
        });
    });

    it('toasts success naming the removed module', async () => {
        const { result } = renderUseRemoveModule();

        await result.current.mutateAsync({ moduleName: 'demo' });

        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Module demo successfully removed'));
    });

    it('invalidates both the module list and installed-modules queries on success', async () => {
        const { result, queryClient } = renderUseRemoveModule();
        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

        await result.current.mutateAsync({ moduleName: 'demo' });

        await waitFor(() => {
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [MODULES_GET_MODULE_LIST] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [MODULES_GET_INSTALLED_MODULES] });
        });
    });

    it('toasts the backend error message when removal fails', async () => {
        fetchPost.mockRejectedValue(new Error('device busy'));
        const { result } = renderUseRemoveModule();

        await expect(result.current.mutateAsync({ moduleName: 'demo' })).rejects.toThrow();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error removing module: device busy'));
    });

    it('falls back to "Unknown error" when the rejection has no message', async () => {
        fetchPost.mockRejectedValue({});
        const { result } = renderUseRemoveModule();

        await expect(result.current.mutateAsync({ moduleName: 'demo' })).rejects.toBeDefined();

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error removing module: Unknown error'));
    });
});
