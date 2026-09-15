/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `Loading` reads its spinner asset off window.Frieren.loadingImage, normally set by
 * umdSupport.js at app boot; this file's isFetching-with-no-cache case renders it directly,
 * so a minimal stub is provided here.
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import RadioConfigForm from '@src/features/wireless/components/RadioConfigModal/RadioConfigForm.jsx';
import useGetRadioConfig from '@src/features/wireless/hooks/useGetRadioConfig.js';
import useSetRadioConfig from '@src/features/wireless/hooks/useSetRadioConfig.js';

vi.mock('@src/features/wireless/hooks/useGetRadioConfig.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/wireless/hooks/useSetRadioConfig.js', () => ({ default: vi.fn() }));

window.Frieren = { loadingImage: 'test-loading.png' };

const setRadioConfig = vi.fn();

const populatedConfig = {
    available: {
        channels: [{ channel: 6, mhz: 2437 }, { channel: 11, mhz: 2462 }],
        txpowers: [{ dbm: 17, mw: 50 }, { dbm: 20, mw: 100 }],
        htmodes: ['HT20', 'HT40'],
        countries: [{ code: 'US', name: 'United States' }],
    },
    current: { channel: '6', txpower: '17', htmode: 'HT20', country: 'US', disabled: '0' },
};

describe('RadioConfigForm', () => {
    beforeEach(() => {
        setRadioConfig.mockReset().mockResolvedValue({});
        useSetRadioConfig.mockReturnValue({ mutateAsync: setRadioConfig });
    });

    it('builds channel/txpower/country option labels from the reported hardware capabilities', () => {
        useGetRadioConfig.mockReturnValue({ data: populatedConfig, isFetching: false });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        expect(within(screen.getByLabelText('Channel')).getByRole('option', { name: '6 (2437 MHz)' })).toBeInTheDocument();
        expect(within(screen.getByLabelText('Channel')).getByRole('option', { name: '11 (2462 MHz)' })).toBeInTheDocument();
        expect(within(screen.getByLabelText('TX Power')).getByRole('option', { name: '17 dBm (50 mW)' })).toBeInTheDocument();
        expect(within(screen.getByLabelText('Country')).getByRole('option', { name: 'United States (US)' })).toBeInTheDocument();
    });

    it('always offers a driver-default option ahead of the reported txpower/country lists', () => {
        useGetRadioConfig.mockReturnValue({ data: populatedConfig, isFetching: false });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        expect(within(screen.getByLabelText('TX Power')).getByRole('option', { name: 'Default (driver)' })).toBeInTheDocument();
        expect(within(screen.getByLabelText('Country')).getByRole('option', { name: 'Default (driver)' })).toBeInTheDocument();
    });

    it('pre-selects the radio\'s current channel/txpower/mode/country/disabled state', () => {
        useGetRadioConfig.mockReturnValue({ data: populatedConfig, isFetching: false });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        expect(screen.getByLabelText('Channel')).toHaveValue('6');
        expect(screen.getByLabelText('TX Power')).toHaveValue('17');
        expect(screen.getByLabelText('Mode / Bandwidth')).toHaveValue('HT20');
        expect(screen.getByLabelText('Country')).toHaveValue('US');
        expect(screen.getByLabelText('Disabled')).not.toBeChecked();
    });

    it('rejects submission when the radio reports no selectable channel or htmode at all', async () => {
        useGetRadioConfig.mockReturnValue({
            data: { available: {}, current: {} },
            isFetching: false,
        });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('Channel is mandatory')).toBeInTheDocument();
        expect(screen.getByText('Mode is mandatory')).toBeInTheDocument();
        expect(setRadioConfig).not.toHaveBeenCalled();
    });

    it('submits the edited configuration and closes the modal', async () => {
        useGetRadioConfig.mockReturnValue({ data: populatedConfig, isFetching: false });
        const onHide = vi.fn();

        render(<RadioConfigForm radio={'radio0'} onHide={onHide} />);

        fireEvent.change(screen.getByLabelText('Channel'), { target: { value: '11' } });
        fireEvent.click(screen.getByLabelText('Disabled'));
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setRadioConfig).toHaveBeenCalledWith({
            radio: 'radio0',
            channel: '11',
            txpower: '17',
            htmode: 'HT20',
            country: 'US',
            disabled: true,
        }));
        await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1));
    });

    it('shows the loading spinner only while there is no cached config to render yet', () => {
        useGetRadioConfig.mockReturnValue({ data: undefined, isFetching: true });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        expect(screen.queryByLabelText('Channel')).not.toBeInTheDocument();
    });

    it('keeps showing the form, not the spinner, during a background refetch of an already-cached config', () => {
        useGetRadioConfig.mockReturnValue({ data: populatedConfig, isFetching: true });

        render(<RadioConfigForm radio={'radio0'} onHide={vi.fn()} />);

        expect(screen.getByLabelText('Channel')).toBeInTheDocument();
    });
});
