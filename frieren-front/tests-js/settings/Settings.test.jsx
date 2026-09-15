/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The five cards share one `getSectionData` query object; a card silently losing that prop
 * would just fall back to its own loading/empty defaults without ever erroring, so the wiring
 * is asserted explicitly here rather than trusted.
 */
import { render, screen } from '@testing-library/react';

import Settings from '@src/features/settings/containers/Settings/index.jsx';
import useGetSectionData from '@src/features/settings/hooks/useGetSectionData.js';

vi.mock('@src/features/settings/hooks/useGetSectionData.js', () => ({ default: vi.fn() }));

vi.mock('@src/features/settings/components/TimezoneCard', () => ({
    default: ({ query }) => <div>TimezoneCard:{query?.data?.timezone}</div>,
}));
vi.mock('@src/features/settings/components/HostnameCard', () => ({
    default: ({ query }) => <div>HostnameCard:{query?.data?.hostname}</div>,
}));
vi.mock('@src/features/settings/components/TerminalSettingsCard', () => ({
    default: ({ query }) => <div>TerminalSettingsCard:{String(query?.data?.terminalEnabled)}</div>,
}));
vi.mock('@src/features/settings/components/PanelThemeCard', () => ({
    default: ({ query }) => <div>PanelThemeCard:{query?.data?.theme}</div>,
}));
vi.mock('@src/features/settings/components/UpdateUserPasswordCard', () => ({
    default: () => <div>UpdateUserPasswordCard</div>,
}));

describe('Settings', () => {
    it('fetches the section data once and forwards it to every card that needs it', () => {
        useGetSectionData.mockReturnValue({
            data: { timezone: 'GMT-3', hostname: 'router-01', terminalEnabled: true, theme: 'dark' },
            isLoading: false,
        });

        render(<Settings />);

        expect(screen.getByText('TimezoneCard:GMT-3')).toBeInTheDocument();
        expect(screen.getByText('HostnameCard:router-01')).toBeInTheDocument();
        expect(screen.getByText('TerminalSettingsCard:true')).toBeInTheDocument();
        expect(screen.getByText('PanelThemeCard:dark')).toBeInTheDocument();
        expect(screen.getByText('UpdateUserPasswordCard')).toBeInTheDocument();
        expect(useGetSectionData).toHaveBeenCalledTimes(1);
    });
});
