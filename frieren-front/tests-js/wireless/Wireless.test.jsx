/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * `Wireless` is a static TABS config fed to the shared `PanelTabs`/`renderPanelTab`. Its only
 * real logic is the grouping: Overview + AssociationListCard live under one tab, Advanced
 * Config is a separate tab. `PanelTabs` (routing/URL sync, owned elsewhere) is mocked so the
 * test isolates that grouping instead of exercising wouter routing.
 */
import { render, screen, within } from '@testing-library/react';

import Wireless from '@src/features/wireless/containers/Wireless/index.jsx';

vi.mock('@src/components/Tabs/PanelTabs', () => ({
    default: ({ id, defaultTab, children }) => (
        <div data-testid={'panel-tabs'} data-id={id} data-default-tab={defaultTab}>{children}</div>
    ),
    renderPanelTab: (id, tab) => (
        <div key={tab.key} data-testid={`tab-${id}-${tab.key}`}>{tab.content}</div>
    ),
}));

vi.mock('@src/features/wireless/components/WirelessOverviewCard', () => ({
    default: () => <div>Overview Card</div>,
}));
vi.mock('@src/features/wireless/components/AssociationListCard', () => ({
    default: () => <div>Association Card</div>,
}));
vi.mock('@src/features/wireless/components/WirelessAdvancedCard', () => ({
    default: () => <div>Advanced Card</div>,
}));

describe('Wireless', () => {
    it('wires the tab set with id "wireless" and "overview" as the default tab', () => {
        render(<Wireless />);

        const tabs = screen.getByTestId('panel-tabs');
        expect(tabs).toHaveAttribute('data-id', 'wireless');
        expect(tabs).toHaveAttribute('data-default-tab', 'overview');
    });

    it('groups the overview and association-list cards together under the overview tab', () => {
        render(<Wireless />);

        const overviewTab = screen.getByTestId('tab-wireless-overview');
        expect(within(overviewTab).getByText('Overview Card')).toBeInTheDocument();
        expect(within(overviewTab).getByText('Association Card')).toBeInTheDocument();
    });

    it('keeps the advanced config tab isolated from the overview cards', () => {
        render(<Wireless />);

        const advancedTab = screen.getByTestId('tab-wireless-advanced');
        expect(within(advancedTab).getByText('Advanced Card')).toBeInTheDocument();
        expect(within(advancedTab).queryByText('Overview Card')).not.toBeInTheDocument();
        expect(within(advancedTab).queryByText('Association Card')).not.toBeInTheDocument();
    });
});
