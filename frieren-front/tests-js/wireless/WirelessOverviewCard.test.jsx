/*
 * Coverage for `WirelessOverviewCard`'s own orchestration logic: it maps the overview query's
 * radio keys to `RadioSection` instances, swaps in a skeleton while loading, and routes each
 * child callback (scan/edit/add, and the post-save status check) to the specific radio that
 * triggered it — not a fixed or "current" one. Every collaborator (`RadioSection`, `ScanModal`,
 * `InterfaceFormModal`, `RadioConfigModal`, `InterfaceStatusNotifier`, the loading skeleton) is
 * mocked to a thin marker that exposes just the props under test, so a wrong radio/section
 * threaded through this component is the only thing that can make these fail.
 *
 * The first test is the original regression case: the network binding for a scan-to-connect is
 * selected from the device's configured network list by the form, not guessed here.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';

import WirelessOverviewCard from '@src/features/wireless/components/WirelessOverviewCard/index.jsx';
import useGetWirelessOverview from '@src/features/wireless/hooks/useGetWirelessOverview.js';

vi.mock('@src/features/wireless/hooks/useGetWirelessOverview.js', () => ({
    default: vi.fn(),
}));

vi.mock('@src/components/PanelCard', () => ({
    default: ({ children }) => <div>{children}</div>,
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard/RadioSection', () => ({
    default: ({ radioName, onScan, onEdit, onAdd, onConfigure, checkingSection, checkingRadio }) => (
        <div data-testid={`radio-section-${radioName}`}>
            <span>{radioName}</span>
            <button onClick={() => onScan(radioName)}>Open scan</button>
            <button onClick={() => onEdit(`${radioName}-iface`, radioName)}>Edit iface</button>
            <button onClick={() => onAdd(radioName)}>Add iface</button>
            <button onClick={() => onConfigure(radioName, 'band')}>Configure radio</button>
            {checkingRadio === radioName && checkingSection && <span>{`checking:${checkingSection}`}</span>}
        </div>
    ),
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard/WirelessOverviewSkeleton', () => ({
    default: () => <div data-testid={'overview-skeleton'} />,
}));

vi.mock('@src/features/wireless/components/ScanModal', () => ({
    default: ({ show, radioName, onConnect }) => (
        show ? (
            <div>
                <span data-testid={'scan-target'}>{radioName}</span>
                <button onClick={() => onConnect({ ssid: 'ExampleNet', security: 'Open' })}>Connect scan result</button>
            </div>
        ) : null
    ),
}));

vi.mock('@src/features/wireless/components/InterfaceFormModal', () => ({
    default: ({ show, radio, section, initialValues, onInterfaceSaved }) => (
        show ? (
            <div>
                <output data-testid={'scan-network'}>{initialValues?.network ?? ''}</output>
                <span data-testid={'form-target'}>{`${radio ?? ''}:${section ?? ''}`}</span>
                <button onClick={() => onInterfaceSaved(section ?? `${radio}-new`)}>Save interface</button>
            </div>
        ) : null
    ),
}));

vi.mock('@src/features/wireless/components/RadioConfigModal', () => ({
    default: () => null,
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard/InterfaceStatusNotifier', () => ({
    default: ({ section, onDone }) => (
        <div>
            <span data-testid={'checking-section'}>{section}</span>
            <button onClick={onDone}>Finish check</button>
        </div>
    ),
}));

const overviewOf = (radios) => ({
    data: radios,
    refetch: vi.fn(),
    isFetching: false,
    isLoading: false,
});

describe('WirelessOverviewCard', () => {
    beforeEach(() => {
        useGetWirelessOverview.mockReturnValue(overviewOf({ radio0: { interfaces: [] } }));
    });

    it('does not guess a device-specific network when connecting from a scan', () => {
        render(<WirelessOverviewCard />);

        fireEvent.click(screen.getByRole('button', { name: 'Open scan' }));
        fireEvent.click(screen.getByRole('button', { name: 'Connect scan result' }));

        expect(screen.getByTestId('scan-network')).toHaveTextContent('');
    });

    it('renders one RadioSection per radio key returned by the overview', () => {
        useGetWirelessOverview.mockReturnValue(overviewOf({ radio0: { interfaces: [] }, radio1: { interfaces: [] } }));

        render(<WirelessOverviewCard />);

        expect(screen.getByTestId('radio-section-radio0')).toBeInTheDocument();
        expect(screen.getByTestId('radio-section-radio1')).toBeInTheDocument();
    });

    it('shows the loading skeleton instead of any radio sections while the overview is loading', () => {
        useGetWirelessOverview.mockReturnValue({ data: undefined, refetch: vi.fn(), isFetching: true, isLoading: true });

        render(<WirelessOverviewCard />);

        expect(screen.getByTestId('overview-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId(/radio-section-/)).not.toBeInTheDocument();
    });

    it('renders no radio sections and no skeleton when the overview data is empty', () => {
        useGetWirelessOverview.mockReturnValue(overviewOf({}));

        render(<WirelessOverviewCard />);

        expect(screen.queryByTestId('overview-skeleton')).not.toBeInTheDocument();
        expect(screen.queryByTestId(/radio-section-/)).not.toBeInTheDocument();
    });

    it('opens the scan modal for the radio whose scan button was clicked, not a different radio', () => {
        useGetWirelessOverview.mockReturnValue(overviewOf({ radio0: { interfaces: [] }, radio1: { interfaces: [] } }));

        render(<WirelessOverviewCard />);
        expect(screen.queryByTestId('scan-target')).not.toBeInTheDocument();

        fireEvent.click(within(screen.getByTestId('radio-section-radio1')).getByRole('button', { name: 'Open scan' }));

        expect(screen.getByTestId('scan-target')).toHaveTextContent('radio1');
    });

    it('opens the edit form addressed to the exact radio and interface section that triggered it', () => {
        useGetWirelessOverview.mockReturnValue(overviewOf({ radio0: { interfaces: [] }, radio1: { interfaces: [] } }));

        render(<WirelessOverviewCard />);

        fireEvent.click(within(screen.getByTestId('radio-section-radio1')).getByRole('button', { name: 'Edit iface' }));

        expect(screen.getByTestId('form-target')).toHaveTextContent('radio1:radio1-iface');
    });

    it('routes an interface-saved status check to the radio that triggered it, and clears it once the check finishes', () => {
        useGetWirelessOverview.mockReturnValue(overviewOf({ radio0: { interfaces: [] }, radio1: { interfaces: [] } }));

        render(<WirelessOverviewCard />);

        fireEvent.click(within(screen.getByTestId('radio-section-radio1')).getByRole('button', { name: 'Add iface' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save interface' }));

        expect(screen.getByTestId('checking-section')).toHaveTextContent('radio1-new');
        expect(within(screen.getByTestId('radio-section-radio1')).getByText('checking:radio1-new')).toBeInTheDocument();
        expect(within(screen.getByTestId('radio-section-radio0')).queryByText(/checking:/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Finish check' }));

        expect(screen.queryByTestId('checking-section')).not.toBeInTheDocument();
        expect(within(screen.getByTestId('radio-section-radio1')).queryByText(/checking:/)).not.toBeInTheDocument();
    });
});
