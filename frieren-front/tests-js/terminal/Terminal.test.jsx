/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `@frieren/terminal-core` only exists via a vite.config.js alias to a sibling package's build
 * output (../frieren-terminal/dist) - there is no npm dependency and vitest.config.js carries
 * no matching alias, so anything that reaches it must be mocked at the boundary. useTerminal,
 * useTerminalStatusEvent and terminalThemes.js (which itself just re-exports TERMINAL_THEMES
 * from that package) are mocked here for that reason, not because their own logic is out of
 * scope - useTerminal and useTerminalStatusEvent remain uncovered pending a vitest.config.js
 * alias for `@frieren/terminal-core` (adding one is a non-test-infra change, out of scope here).
 * terminalStatusAtom/terminalSettingsAtom are real jotai atoms read back through a per-test
 * store (as in InstalledModulesCard.test.jsx).
 */
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

import Terminal from '@src/features/terminal/containers/index.jsx';
import terminalStatusAtom from '@src/features/terminal/atoms/terminalStatusAtom.js';
import terminalSettingsAtom from '@src/features/terminal/atoms/terminalSettingsAtom.js';
import useTerminal from '@src/features/terminal/hooks/useTerminal.js';
import useTerminalStatusEvent from '@src/features/terminal/hooks/useTerminalStatusEvent.js';
import useCloseTerminalMutation from '@src/features/terminal/hooks/useCloseTerminalMutation.js';

vi.mock('@src/features/terminal/hooks/useTerminal.js', () => ({ default: vi.fn(() => ({ current: null })) }));
vi.mock('@src/features/terminal/hooks/useTerminalStatusEvent.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/terminal/hooks/useCloseTerminalMutation.js', () => ({ default: vi.fn() }));
vi.mock('@src/features/terminal/helpers/terminalThemes.js', () => ({
    TERMINAL_THEMES: {
        default: { background: 'blue' },
        dracula: { background: 'red' },
    },
}));

const renderTerminal = (initialValues = []) => {
    const store = createStore();
    initialValues.forEach(([atom, value]) => store.set(atom, value));

    return render(<Provider store={store}><Terminal /></Provider>);
};

describe('Terminal', () => {
    beforeEach(() => {
        useTerminal.mockClear();
        useTerminalStatusEvent.mockClear();
        useCloseTerminalMutation.mockReturnValue({ mutate: vi.fn() });
    });

    it('renders nothing when the terminal is closed', () => {
        const { container } = renderTerminal([[terminalStatusAtom, false]]);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the header and panel, and wires up the session hooks, when the terminal is open', () => {
        renderTerminal([[terminalStatusAtom, true]]);

        expect(screen.getByText('Terminal')).toBeInTheDocument();
        expect(useTerminal).toHaveBeenCalled();
        expect(useTerminalStatusEvent).toHaveBeenCalled();
    });

    it('falls back to the default theme background when the configured theme is unknown', () => {
        const { container } = renderTerminal([
            [terminalStatusAtom, true],
            [terminalSettingsAtom, { terminalTheme: 'not-a-real-theme', fontSize: 13, cursorStyle: 'block', cursorBlink: false }],
        ]);

        const panel = container.querySelector('.w-100.h-100').parentElement;
        expect(panel.style.backgroundColor).toBe('blue');
    });

    it('uses the configured theme background when it is known', () => {
        const { container } = renderTerminal([
            [terminalStatusAtom, true],
            [terminalSettingsAtom, { terminalTheme: 'dracula', fontSize: 13, cursorStyle: 'block', cursorBlink: false }],
        ]);

        const panel = container.querySelector('.w-100.h-100').parentElement;
        expect(panel.style.backgroundColor).toBe('red');
    });
});
