/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * Renders the real SyncFromBrowserButton (not mocked) so a regression where TimezoneCard
 * stops wiring it into the form footer would also be caught here; only the fetch-triggering
 * hooks are mocked.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TimezoneCard from '@src/features/settings/components/TimezoneCard/index.jsx';
import useSetTimezone from '@src/features/settings/hooks/useSetTimezone.js';
import useSetDatetimeFromBrowser from '@src/features/settings/hooks/useSetDatetimeFromBrowser';

vi.mock('@src/features/settings/hooks/useSetTimezone.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/settings/hooks/useSetDatetimeFromBrowser', () => ({ default: vi.fn() }));

const setTimezone = vi.fn();
const syncFromBrowser = vi.fn();

describe('TimezoneCard', () => {
    beforeEach(() => {
        setTimezone.mockReset().mockResolvedValue({});
        syncFromBrowser.mockReset();
        useSetTimezone.mockReturnValue({ mutateAsync: setTimezone });
        useSetDatetimeFromBrowser.mockReturnValue({ mutate: syncFromBrowser, isPending: false });
    });

    it('shows skeleton placeholders instead of the select while the section data is loading', () => {
        render(<TimezoneCard query={{ isLoading: true }} />);

        expect(screen.queryByLabelText('Timezone')).not.toBeInTheDocument();
    });

    it('pre-selects the saved timezone', () => {
        render(<TimezoneCard query={{ isLoading: false, data: { timezone: 'GMT-3' } }} />);

        expect(screen.getByLabelText('Timezone')).toHaveValue('GMT-3');
    });

    it('submits the chosen timezone', async () => {
        render(<TimezoneCard query={{ isLoading: false, data: { timezone: 'GMT-3' } }} />);

        fireEvent.change(screen.getByLabelText('Timezone'), { target: { value: 'GMT+9' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setTimezone).toHaveBeenCalledWith({ timezone: 'GMT+9' }, expect.anything()));
    });

    it('wires up the browser sync button alongside the timezone form', () => {
        render(<TimezoneCard query={{ isLoading: false, data: { timezone: 'GMT-3' } }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Sync from Browser' }));

        expect(syncFromBrowser).toHaveBeenCalledTimes(1);
    });
});
