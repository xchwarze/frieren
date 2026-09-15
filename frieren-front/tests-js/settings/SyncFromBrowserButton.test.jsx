/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen } from '@testing-library/react';

import SyncFromBrowserButton from '@src/features/settings/components/SyncFromBrowserButton/index.jsx';
import useSetDatetimeFromBrowser from '@src/features/settings/hooks/useSetDatetimeFromBrowser';

vi.mock('@src/features/settings/hooks/useSetDatetimeFromBrowser', () => ({ default: vi.fn() }));

const mutate = vi.fn();

describe('SyncFromBrowserButton', () => {
    beforeEach(() => {
        mutate.mockReset();
        useSetDatetimeFromBrowser.mockReturnValue({ mutate, isPending: false });
    });

    it('triggers the browser datetime sync on click', () => {
        render(<SyncFromBrowserButton />);

        fireEvent.click(screen.getByRole('button', { name: 'Sync from Browser' }));

        expect(mutate).toHaveBeenCalledTimes(1);
    });

    it('disables the button while the sync is pending', () => {
        useSetDatetimeFromBrowser.mockReturnValue({ mutate, isPending: true });

        render(<SyncFromBrowserButton />);

        expect(screen.getByRole('button', { name: 'Sync from Browser' })).toBeDisabled();
    });
});
