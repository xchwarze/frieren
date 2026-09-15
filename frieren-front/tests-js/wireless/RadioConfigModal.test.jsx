/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * RadioConfigForm's own validation/option-building logic is covered by RadioConfigForm.test.jsx;
 * this file only covers what the Modal wrapper itself owns — the title, mounting the form only
 * while shown, and that radioName/onHide really reach the real child end to end.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import RadioConfigModal from '@src/features/wireless/components/RadioConfigModal/index.jsx';
import useGetRadioConfig from '@src/features/wireless/hooks/useGetRadioConfig.js';
import useSetRadioConfig from '@src/features/wireless/hooks/useSetRadioConfig.js';

vi.mock('@src/features/wireless/hooks/useGetRadioConfig.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useSetRadioConfig.js', () => ({ default: vi.fn() }));

window.Frieren = { loadingImage: 'test-loading.png' };

const setRadioConfig = vi.fn();

const radioConfig = {
    available: {
        channels: [{ channel: 6, mhz: 2437 }],
        txpowers: [{ dbm: 17, mw: 50 }],
        htmodes: ['HT20'],
        countries: [{ code: 'US', name: 'United States' }],
    },
    current: { channel: '6', txpower: '17', htmode: 'HT20', country: 'US', disabled: '0', cell_density: '0', distance: '0' },
};

describe('RadioConfigModal', () => {
    beforeEach(() => {
        setRadioConfig.mockReset().mockResolvedValue({});
        useGetRadioConfig.mockClear();
        useSetRadioConfig.mockReturnValue({ mutateAsync: setRadioConfig });
        useGetRadioConfig.mockReturnValue({ data: radioConfig, isFetching: false });
    });

    it('titles the modal with the radio name and band', () => {
        render(<RadioConfigModal show radioName={'radio0'} band={'5GHz'} onHide={vi.fn()} />);

        expect(screen.getByText('Radio Configuration — radio0 (5GHz)')).toBeInTheDocument();
    });

    it('falls back to "Unknown" when no band is reported', () => {
        render(<RadioConfigModal show radioName={'radio0'} band={undefined} onHide={vi.fn()} />);

        expect(screen.getByText('Radio Configuration — radio0 (Unknown)')).toBeInTheDocument();
    });

    it('does not mount the form (or fetch the radio config) while hidden', () => {
        render(<RadioConfigModal show={false} radioName={'radio0'} band={'5GHz'} onHide={vi.fn()} />);

        expect(screen.queryByLabelText('Channel')).not.toBeInTheDocument();
        expect(useGetRadioConfig).not.toHaveBeenCalled();
    });

    it('loads the radio into the form and saves edits back through to onHide', async () => {
        const onHide = vi.fn();
        render(<RadioConfigModal show radioName={'radio0'} band={'5GHz'} onHide={onHide} />);

        expect(useGetRadioConfig).toHaveBeenCalledWith('radio0');
        expect(screen.getByLabelText('Channel')).toHaveValue('6');

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setRadioConfig).toHaveBeenCalledWith({
            radio: 'radio0',
            channel: '6',
            txpower: '17',
            htmode: 'HT20',
            country: 'US',
            disabled: false,
            cellDensity: '0',
            distance: 0,
        }));
        await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
    });
});
