/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * See useRemoveInterface.test.js for why useAuthenticatedMutation/sleep are mocked at the
 * boundary. This hook's own logic is the success toast wording, which flips on the mutation's
 * own `disabled` variable rather than a fixed string — worth pinning down directly.
 */
import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useToggleInterface from '@src/features/wireless/hooks/useToggleInterface.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('@src/helpers/actionsHelper.js', () => ({ sleep: vi.fn().mockResolvedValue(undefined) }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: vi.fn() }));

describe('useToggleInterface', () => {
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

    it('toggles the interface by section', () => {
        renderHook(() => useToggleInterface());

        capturedOptions.mutationFn({ section: 'wlan1', disabled: true });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'wireless',
            action: 'toggleInterface',
            section: 'wlan1',
            disabled: true,
        });
    });

    it('confirms disabling with a disabled-specific toast, then invalidates the overview', async () => {
        renderHook(() => useToggleInterface());

        await capturedOptions.onSuccess(undefined, { section: 'wlan1', disabled: true });

        expect(toast.success).toHaveBeenCalledWith('Interface disabled');
        expect(sleep).toHaveBeenCalledWith(1500);
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
    });

    it('confirms enabling with an enabled-specific toast, not the disabled wording', async () => {
        renderHook(() => useToggleInterface());

        await capturedOptions.onSuccess(undefined, { section: 'wlan1', disabled: false });

        expect(toast.success).toHaveBeenCalledWith('Interface enabled');
    });

    it('shows an error toast on failure and leaves the cache untouched', () => {
        renderHook(() => useToggleInterface());

        capturedOptions.onError();

        expect(toast.error).toHaveBeenCalledWith('Failed to toggle interface');
        expect(invalidateQueries).not.toHaveBeenCalled();
    });
});
