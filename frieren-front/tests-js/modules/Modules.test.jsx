/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The container's own logic is just wiring: it must fetch available modules lazily (the
 * card offers an explicit "Get Modules" button) and it must hand the SAME installed-modules
 * query to both cards, since AvailableModulesCard needs it to know what's already installed.
 * Child components are mocked to isolate that wiring from their own rendering.
 */
import { render, screen } from '@testing-library/react';

import Modules from '@src/features/modules/containers/Modules/index.jsx';
import useAvailableModules from '@src/features/modules/hooks/useAvailableModules.js';
import useInstalledModules from '@src/features/modules/hooks/useInstalledModules.js';

vi.mock('@src/features/modules/hooks/useAvailableModules.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/modules/hooks/useInstalledModules.js', () => ({ default: vi.fn() }));

vi.mock('@src/features/modules/components/AvailableModulesCard', () => ({
    default: ({ availableQuery, installedQuery }) => (
        <output data-testid={'available-card'}>{JSON.stringify({ available: availableQuery.data, installed: installedQuery.data })}</output>
    ),
}));
vi.mock('@src/features/modules/components/InstalledModulesCard', () => ({
    default: ({ installedQuery }) => <output data-testid={'installed-card'}>{JSON.stringify(installedQuery.data)}</output>,
}));
vi.mock('@src/features/modules/components/InstallModal', () => ({ default: () => <div data-testid={'install-modal'} /> }));
vi.mock('@src/features/modules/components/ConfirmationModalWrapper', () => ({ default: () => <div data-testid={'confirmation-modal'} /> }));

describe('Modules', () => {
    beforeEach(() => {
        useAvailableModules.mockReturnValue({ data: [{ name: 'evilportal' }], isSuccess: false });
        useInstalledModules.mockReturnValue({ data: [{ name: 'mdk4' }], isSuccess: true });
    });

    it('fetches available modules lazily so the card must opt in via its "Get Modules" button', () => {
        render(<Modules />);

        expect(useAvailableModules).toHaveBeenCalledWith({ enabled: false });
    });

    it('shares the same installed-modules query with both the available and installed cards', () => {
        render(<Modules />);

        expect(screen.getByTestId('installed-card')).toHaveTextContent(JSON.stringify([{ name: 'mdk4' }]));
        expect(screen.getByTestId('available-card')).toHaveTextContent(
            JSON.stringify({ available: [{ name: 'evilportal' }], installed: [{ name: 'mdk4' }] })
        );
    });

    it('always renders the install modal and the removal confirmation modal alongside the cards', () => {
        render(<Modules />);

        expect(screen.getByTestId('install-modal')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });
});
