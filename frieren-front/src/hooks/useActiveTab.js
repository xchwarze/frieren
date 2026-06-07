/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useLocation } from 'wouter';

/**
 * Reads/writes the active tab from the URL so tabs are deep-linkable and can be
 * opened in a separate window. The active tab is the path segment after the
 * container base, e.g. `#/network/dhcp` → id 'network', tab 'dhcp'.
 *
 * @param {String} id - The container base path segment (e.g. 'network').
 * @param {String} defaultValue - Tab used when the URL carries no tab segment.
 * @return {Object} { activeTab, setActiveTab } where setActiveTab(tab, options)
 *                   navigates to `#/<id>/<tab>` (pass { replace: true } to avoid a history entry).
 */
const useActiveTab = (id, defaultValue) => {
    const [location, navigate] = useLocation();
    const prefix = `/${id}/`;
    const segment = location.startsWith(prefix) ? location.slice(prefix.length).split('/')[0] : '';
    const activeTab = segment || defaultValue;
    const setActiveTab = (tab, options) => navigate(`/${id}/${tab}`, options);

    return { activeTab, setActiveTab };
};

export default useActiveTab;
