/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PanelThemeCard from '@src/features/settings/components/PanelThemeCard/index.jsx';
import useSetPanelTheme from '@src/features/settings/hooks/useSetPanelTheme.js';

vi.mock('@src/features/settings/hooks/useSetPanelTheme.js', () => ({ default: vi.fn() }));

const setPanelTheme = vi.fn();

describe('PanelThemeCard', () => {
    beforeEach(() => {
        setPanelTheme.mockReset().mockResolvedValue({});
        useSetPanelTheme.mockReturnValue({ mutateAsync: setPanelTheme });
    });

    it('shows skeleton placeholders instead of the select while the section data is loading', () => {
        const { container } = render(<PanelThemeCard query={{ isLoading: true }} />);

        expect(screen.queryByLabelText('Interface Theme')).not.toBeInTheDocument();
        expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(3);
    });

    it('defaults to "auto" when no theme has been saved yet', () => {
        render(<PanelThemeCard query={{ isLoading: false, data: {} }} />);

        expect(screen.getByLabelText('Interface Theme')).toHaveValue('auto');
    });

    it('pre-selects the saved theme', () => {
        render(<PanelThemeCard query={{ isLoading: false, data: { theme: 'dark' } }} />);

        expect(screen.getByLabelText('Interface Theme')).toHaveValue('dark');
    });

    it('submits the chosen theme', async () => {
        render(<PanelThemeCard query={{ isLoading: false, data: { theme: 'auto' } }} />);

        fireEvent.change(screen.getByLabelText('Interface Theme'), { target: { value: 'light' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(setPanelTheme).toHaveBeenCalledWith({ theme: 'light' }, expect.anything()));
    });
});
