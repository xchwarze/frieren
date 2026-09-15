/*
 * Regression coverage for the scan-to-connect flow: the network binding is selected from
 * the device's configured network list by the form, not guessed here.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import WirelessOverviewCard from '@src/features/wireless/components/WirelessOverviewCard/index.jsx';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';

vi.mock('@src/features/wireless/hooks/useGetWirelessOverview.js', () => ({
    default: vi.fn(),
}));

vi.mock('@src/components/PanelCard', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard/RadioSection', () => ({
    default: ({ onScan }) => <button onClick={() => onScan('radio0')}>Open scan</button>,
}));

vi.mock('@src/features/wireless/components/ScanModal', () => ({
    default: ({ onConnect }) => (
        <button onClick={() => onConnect({ ssid: 'ExampleNet', security: 'Open' })}>Connect scan result</button>
    ),
}));

vi.mock('@src/features/wireless/components/InterfaceFormModal', () => ({
    default: ({ initialValues }) => (
        <output data-testid={'scan-network'}>{initialValues?.network ?? ''}</output>
    ),
}));

vi.mock('@src/features/wireless/components/RadioConfigModal', () => ({
    default: () => null,
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard/InterfaceStatusNotifier', () => ({
    default: () => null,
}));

describe('WirelessOverviewCard', () => {
    beforeEach(() => {
        useGetWirelessOverview.mockReturnValue({
            data: { radio0: { interfaces: [] } },
            refetch: vi.fn(),
            isFetching: false,
            isLoading: false,
        });
    });

    it('does not guess a device-specific network when connecting from a scan', () => {
        render(<WirelessOverviewCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Open scan' }));
        fireEvent.click(screen.getByRole('button', { name: 'Connect scan result' }));

        expect(screen.getByTestId('scan-network')).toHaveTextContent('');
    });
});
