/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `useAuthenticatedMutation` is mocked at the module boundary so the hook's own onSuccess/
 * onError wiring (toast feedback + overview cache invalidation) is exercised directly instead
 * of through a real mutation lifecycle. `sleep` is mocked to resolve immediately so the test
 * doesn't pay the real 1.5s UX delay before the invalidation is asserted.
 */
import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useRemoveInterface from '@src/features/wireless/hooks/useRemoveInterface.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('@src/helpers/actionsHelper.js', () => ({ sleep: vi.fn().mockResolvedValue(undefined) }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: vi.fn() }));

describe('useRemoveInterface', () => {
    let capturedOptions;
    const invalidateQueries = vi.fn();

    beforeEach(() => {
        fetchPost.mockReset();
        sleep.mockClear();
        toast.success.mockReset();
        toast.error.mockReset();
        invalidateQueries.mockReset();
        useQueryClient.mockReturnValue({ invalidateQueries });
        useAuthenticatedMutation.mockImplementation((options) => {
            capturedOptions = options;
            return {};
        });
    });

    it('removes the interface by its UCI section', () => {
        renderHook(() => useRemoveInterface());

        capturedOptions.mutationFn({ section: 'wlan1' });

        expect(fetchPost).toHaveBeenCalledWith({ module: 'wireless', action: 'removeInterface', section: 'wlan1' });
    });

    it('confirms via toast and invalidates the overview cache after a delay on success', async () => {
        renderHook(() => useRemoveInterface());

        await capturedOptions.onSuccess();

        expect(toast.success).toHaveBeenCalledWith('Interface removed');
        expect(sleep).toHaveBeenCalledWith(1500);
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
    });

    it('shows an error toast on failure and leaves the cache untouched', () => {
        renderHook(() => useRemoveInterface());

        capturedOptions.onError();

        expect(toast.error).toHaveBeenCalledWith('Failed to remove interface');
        expect(invalidateQueries).not.toHaveBeenCalled();
    });
});
