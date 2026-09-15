/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `collapseStatusAtom`/`socketStatusAtom` are real jotai atoms read back through a per-test
 * `store` (mirrors InstalledModulesCard.test.jsx), so the collapse toggle exercises the real
 * setter rather than a mock. Only `useCloseTerminalMutation` is mocked at the boundary.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import TerminalHeader from '@src/features/terminal/components/TerminalHeader/index.jsx';
import collapseStatusAtom from '@src/features/terminal/atoms/collapseStatusAtom.js';
import socketStatusAtom from '@src/features/terminal/atoms/socketStatusAtom.js';
import useCloseTerminalMutation from '@src/features/terminal/hooks/useCloseTerminalMutation.js';

vi.mock('@src/features/terminal/hooks/useCloseTerminalMutation.js', () => ({ default: vi.fn() }));

const closeTerminalMutation = vi.fn();

const renderHeader = (initialValues = []) => {
    const store = createStore();
    initialValues.forEach(([atom, value]) => store.set(atom, value));

    return { store, ...render(<Provider store={store}><TerminalHeader /></Provider>) };
};

describe('TerminalHeader', () => {
    beforeEach(() => {
        closeTerminalMutation.mockReset();
        useCloseTerminalMutation.mockReturnValue({ mutate: closeTerminalMutation });
    });

    it('shows the dead/offline state when the socket is disconnected', () => {
        renderHeader([[socketStatusAtom, 'disconnected']]);

        expect(screen.getByText('Terminal (DEAD)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close terminal' })).toHaveClass('btn-danger');
    });

    it('shows the normal state when the socket is not disconnected', () => {
        renderHeader([[socketStatusAtom, 'connected']]);

        expect(screen.getByText('Terminal')).toBeInTheDocument();
        expect(screen.queryByText('Terminal (DEAD)')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close terminal' })).toHaveClass('btn-secondary');
    });

    it('toggles the collapse control label and icon when clicked', () => {
        renderHeader([[collapseStatusAtom, true]]);

        expect(screen.getByRole('button', { name: 'Expand terminal' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Expand terminal' }));

        expect(screen.getByRole('button', { name: 'Collapse terminal' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Expand terminal' })).not.toBeInTheDocument();
    });

    it('calls the close mutation when the close button is clicked', () => {
        renderHeader();

        fireEvent.click(screen.getByRole('button', { name: 'Close terminal' }));

        expect(closeTerminalMutation).toHaveBeenCalledTimes(1);
    });
});
