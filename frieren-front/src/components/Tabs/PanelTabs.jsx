/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { Children, useEffect } from 'react';
import { useLocation } from 'wouter';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import PropTypes from 'prop-types';

import useActiveTab from '@src/hooks/useActiveTab.js';
import TabTitle from '@src/components/Tabs/TabTitle';
import ConditionalTabContent from '@src/components/Tabs/ConditionalTabContent';

/**
 * Builds a single panel tab from a config entry. Returns a real <Tab> so
 * react-bootstrap <Tabs> can introspect it to render the nav.
 *
 * @param {String} id - The container base path segment (e.g. 'network').
 * @param {Object} tab - { key, title, icon, content }.
 * @return {ReactElement} The <Tab> element.
 */
export const renderPanelTab = (id, { key, title, icon, content }) => (
    <Tab key={key} eventKey={key} title={<TabTitle title={title} icon={icon} />}>
        <ConditionalTabContent id={id} eventKey={key}>
            {content}
        </ConditionalTabContent>
    </Tab>
);

/**
 * Generates panel tabs whose active tab is driven by the URL (`#/<id>/<tab>`).
 * Keeps the URL canonical: a missing/invalid tab segment is replaced with the
 * default tab so every tab is deep-linkable and openable in a separate window.
 *
 * @param {String} id - The unique identifier / base path segment for the tabs.
 * @param {String} defaultTab - The default tab to be active.
 * @param {ReactNode} children - The <Tab> elements to render.
 * @return {ReactNode} The panel tabs component.
 */
const PanelTabs = ({ id, defaultTab, children }) => {
    const { activeTab, setActiveTab } = useActiveTab(id, defaultTab);
    const [location] = useLocation();

    const validKeys = Children.toArray(children)
        .map((child) => child?.props?.eventKey)
        .filter(Boolean);

    useEffect(() => {
        const tab = validKeys.includes(activeTab) ? activeTab : defaultTab;
        if (location !== `/${id}/${tab}`) {
            setActiveTab(tab, { replace: true });
        }
    }, [location, activeTab]);

    // Wrap in a div so react-bootstrap's Tabs fragment (Nav + TabContent) is a
    // single child of the page container — otherwise the container's `gap-*`
    // leaks between the tab nav and the tab content.
    return (
        <div>
            <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key)} fill={true}>
                {children}
            </Tabs>
        </div>
    );
};

PanelTabs.propTypes = {
    id: PropTypes.string.isRequired,
    defaultTab: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default PanelTabs;
