/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * See useRemoveInterface.test.js for why useAuthenticatedMutation/sleep are mocked at the
 * boundary. This hook's own logic is the field mapping in mutationFn plus invalidating BOTH
 * the overview and the radio config caches on success — a regression dropping either key
 * would leave stale data on screen after a save.
 */
import { renderHook } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useSetRadioConfig from '@src/features/wireless/hooks/useSetRadioConfig.js';
import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { sleep } from '@src/helpers/actionsHelper.js';
import { WIRELESS_GET_WIRELESS_OVERVIEW, WIRELESS_GET_RADIO_CONFIG } from '@src/features/wireless/helpers/queryKeys.js';

vi.mock('@src/hooks/useAuthenticatedMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/services/fetchService.js', () => ({ fetchPost: vi.fn() }));
vi.mock('@src/helpers/actionsHelper.js', () => ({ sleep: vi.fn().mockResolvedValue(undefined) }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: vi.fn() }));

describe('useSetRadioConfig', () => {
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

    it('sends exactly the radio config fields to setRadioConfig', () => {
        renderHook(() => useSetRadioConfig());

        capturedOptions.mutationFn({
            radio: 'radio0',
            channel: '11',
            txpower: '20',
            htmode: 'HE40',
            country: 'US',
            disabled: false,
        });

        expect(fetchPost).toHaveBeenCalledWith({
            module: 'wireless',
            action: 'setRadioConfig',
            radio: 'radio0',
            channel: '11',
            txpower: '20',
            htmode: 'HE40',
            country: 'US',
            disabled: false,
        });
    });

    it('invalidates both the overview and the radio config caches after a delay on success', async () => {
        renderHook(() => useSetRadioConfig());

        await capturedOptions.onSuccess();

        expect(toast.success).toHaveBeenCalledWith('Radio configuration updated');
        expect(sleep).toHaveBeenCalledWith(1500);
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [WIRELESS_GET_WIRELESS_OVERVIEW] });
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [WIRELESS_GET_RADIO_CONFIG] });
    });

    it('shows an error toast on failure and leaves both caches untouched', () => {
        renderHook(() => useSetRadioConfig());

        capturedOptions.onError();

        expect(toast.error).toHaveBeenCalledWith('Failed to update radio configuration');
        expect(invalidateQueries).not.toHaveBeenCalled();
    });
});
