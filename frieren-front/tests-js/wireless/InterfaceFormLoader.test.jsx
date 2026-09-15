/*
 * Regression coverage for add-mode defaults: device-dependent network names must not be
 * seeded before the network capability query resolves.
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

describe('InterfaceFormLoader', () => {
    beforeEach(() => {
        useGetInterfaceConfig.mockReturnValue({ data: undefined, isFetching: false });
    });

    it('does not seed a device-specific network for a new interface', () => {
        render(<InterfaceFormLoader radio={'radio0'} onHide={vi.fn()} />);

        expect(JSON.parse(screen.getByTestId('interface-defaults').textContent).network).toBe('');
    });
});
