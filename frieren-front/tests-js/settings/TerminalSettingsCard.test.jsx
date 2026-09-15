/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * TerminalAppearanceFields collapses/expands purely off the live `terminalEnabled` watch (it
 * registers no field of its own) - covering both the initial-mount state driven by loaded data
 * and the live toggle, since either path could silently stop reacting to the watch.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TerminalSettingsCard from '@src/features/settings/components/TerminalSettingsCard/index.jsx';
import useSetTerminalSettings from '@src/features/settings/hooks/useSetTerminalSettings.js';

vi.mock('@src/features/settings/hooks/useSetTerminalSettings.js', () => ({ default: vi.fn() }));

// terminalThemes.js re-exports TERMINAL_THEMES from the @frieren/terminal-core workspace
// package, which vitest.config.js (unlike vite.config.js) has no alias for. Stubbing this
// module keeps the test isolated from that build-only resolution gap.
vi.mock('@src/features/terminal/helpers/terminalThemes.js', () => ({
    TERMINAL_THEME_OPTIONS: [
        { value: 'default', label: 'Default' },
        { value: 'dracula', label: 'Dracula' },
        { value: 'nord', label: 'Nord' },
    ],
}));

const setTerminalSettings = vi.fn();

const loadedTerminalData = {
    terminalEnabled: true,
    terminalTheme: 'nord',
    fontSize: 16,
    cursorStyle: 'underline',
    cursorBlink: true,
    terminalAutologin: false,
};

describe('TerminalSettingsCard', () => {
    beforeEach(() => {
        setTerminalSettings.mockReset().mockResolvedValue({});
        useSetTerminalSettings.mockReturnValue({ mutateAsync: setTerminalSettings });
    });

    it('shows skeleton placeholders instead of the form while the section data is loading', () => {
        const { container } = render(<TerminalSettingsCard query={{ isLoading: true }} />);

        expect(screen.queryByLabelText('Enable terminal support')).not.toBeInTheDocument();
        expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(9);
    });

    it('hides the appearance fields when the loaded settings have the terminal disabled', () => {
        render(<TerminalSettingsCard query={{ isLoading: false, data: { terminalEnabled: false } }} />);

        expect(screen.getByLabelText('Enable terminal support')).not.toBeChecked();
        expect(screen.queryByLabelText('Terminal Theme')).not.toBeInTheDocument();
    });

    it('shows the appearance fields immediately when the loaded settings have the terminal enabled', () => {
        render(<TerminalSettingsCard query={{ isLoading: false, data: loadedTerminalData }} />);

        expect(screen.getByLabelText('Terminal Theme')).toHaveValue('nord');
        expect(screen.getByLabelText('Font Size')).toHaveValue(16);
        expect(screen.getByLabelText('Cursor Style')).toHaveValue('underline');
        expect(screen.getByLabelText('Cursor Blink')).toBeChecked();
        expect(screen.getByLabelText('Use Autologin')).not.toBeChecked();
    });

    it('reveals the appearance fields as soon as the enable switch is turned on', async () => {
        render(<TerminalSettingsCard query={{ isLoading: false, data: { terminalEnabled: false } }} />);

        fireEvent.click(screen.getByLabelText('Enable terminal support'));

        expect(await screen.findByLabelText('Terminal Theme')).toBeInTheDocument();
    });

    it('submits the edited terminal settings', async () => {
        render(<TerminalSettingsCard query={{ isLoading: false, data: loadedTerminalData }} />);

        fireEvent.change(screen.getByLabelText('Terminal Theme'), { target: { value: 'dracula' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setTerminalSettings).toHaveBeenCalledWith({
            terminalTheme: 'dracula',
            fontSize: 16,
            cursorStyle: 'underline',
            cursorBlink: true,
            terminalAutologin: false,
            terminalEnabled: true,
        }, expect.anything()));
    });

    it('blocks submission and shows a validation error when the font size is below the minimum', async () => {
        render(<TerminalSettingsCard query={{ isLoading: false, data: loadedTerminalData }} />);

        fireEvent.change(screen.getByLabelText('Font Size'), { target: { value: '4' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(await screen.findByText('Minimum 8')).toBeInTheDocument();
        expect(setTerminalSettings).not.toHaveBeenCalled();
    });
});
