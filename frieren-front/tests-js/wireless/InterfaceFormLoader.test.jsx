/*
 * Regression coverage for add-mode defaults: device-dependent network names must not be
 * seeded before the network capability query resolves. Also covers edit-mode default seeding
 * (including the raw-UCI-to-form normalizeEncryption mapping and '1'/'0' boolean coercion) and
 * the fetching state, which InterfaceForm.test.jsx deliberately does not touch.
 *
 * `Loading` reads its spinner asset off window.Frieren.loadingImage, normally set by
 * umdSupport.js at app boot; the isFetching case here renders it directly, so a stub is
 * provided.
 */
import { render, screen } from '@testing-library/react';

import InterfaceFormLoader from '@src/features/wireless/components/InterfaceFormModal/InterfaceFormLoader.jsx';
import useGetInterfaceConfig from '@src/features/wireless/hooks/useGetInterfaceConfig.js';

vi.mock('@src/features/wireless/hooks/useGetInterfaceConfig.js', () => ({
    default: vi.fn(),
}));

vi.mock('@src/features/wireless/components/InterfaceFormModal/InterfaceForm', () => ({
    default: ({ defaultValues }) => (
        <output data-testid={'interface-defaults'}>{JSON.stringify(defaultValues)}</output>
    ),
}));

window.Frieren = { loadingImage: 'test-loading.png' };

const renderedDefaults = () => JSON.parse(screen.getByTestId('interface-defaults').textContent);

describe('InterfaceFormLoader', () => {
    beforeEach(() => {
        useGetInterfaceConfig.mockReturnValue({ data: undefined, isFetching: false });
    });

    it('does not seed a device-specific network for a new interface', () => {
        render(<InterfaceFormLoader radio={'radio0'} onHide={vi.fn()} />);

        expect(renderedDefaults().network).toBe('');
    });

    it('uses the caller-provided initialValues for a new interface instead of the generic defaults', () => {
        const initialValues = {
            ssid: '', mode: 'monitor', network: '', encryption: 'none', key: '',
            hidden: false, disabled: false, isManagement: false, isRecon: true,
        };

        render(<InterfaceFormLoader radio={'radio0'} onHide={vi.fn()} initialValues={initialValues} />);

        expect(renderedDefaults()).toEqual(initialValues);
    });

    it('shows a loading spinner instead of the form while the interface config is fetching', () => {
        useGetInterfaceConfig.mockReturnValue({ data: undefined, isFetching: true });

        render(<InterfaceFormLoader section={'wlan0'} onHide={vi.fn()} />);

        expect(screen.queryByTestId('interface-defaults')).not.toBeInTheDocument();
    });

    it('seeds edit-mode defaults from the fetched config, coercing UCI \'1\'/\'0\' flags to booleans', () => {
        useGetInterfaceConfig.mockReturnValue({
            data: {
                ssid: 'MyAP', mode: 'ap', network: 'lan', encryption: 'psk2', key: 'secret123',
                hidden: '1', disabled: '1', isManagement: '1', isRecon: '0',
            },
            isFetching: false,
        });

        render(<InterfaceFormLoader section={'wlan0'} onHide={vi.fn()} />);

        expect(renderedDefaults()).toEqual({
            ssid: 'MyAP', mode: 'ap', network: 'lan', encryption: 'psk2+ccmp', key: 'secret123',
            hidden: true, disabled: true, isManagement: true, isRecon: false,
        });
    });

    it.each([
        ['none', 'none'],
        [undefined, 'none'],
        ['psk2', 'psk2+ccmp'],
        ['psk', 'psk-mixed+ccmp'],
        ['psk-mixed', 'psk-mixed+ccmp'],
        ['sae+ccmp', 'sae'],
        ['sae', 'sae'], // not one of the mapped legacy values: passed through unchanged
    ])('normalizes a raw UCI encryption of %s to %s for the form', (rawEncryption, expected) => {
        useGetInterfaceConfig.mockReturnValue({
            data: { ssid: 'AP', mode: 'ap', network: 'lan', encryption: rawEncryption, key: '' },
            isFetching: false,
        });

        render(<InterfaceFormLoader section={'wlan0'} onHide={vi.fn()} />);

        expect(renderedDefaults().encryption).toBe(expected);
    });
});
