/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import useActiveTab from '@src/hooks/useActiveTab.js';

/**
 * Renders the tab children content based on the active tab state.
 *
 * @param {String} id - The identifier of the tabs.
 * @param {String} eventKey - The key of the event triggering the tab.
 * @param {Boolean} [gap] - Add a top gap (`mt-3`) between the tab nav and the content.
 *   Opt-in: most tab content (a `PanelCard`, a table) owns its own spacing and needs none.
 *   Set it only when the content sits flush against the nav, e.g. tabs nested in tabs.
 * @param {Object} children - The content to be rendered.
 * @return {ReactElement} The rendered children content or null.
 */
const ConditionalTabContent = ({ id, eventKey, gap = false, children }) => {
    const { activeTab } = useActiveTab(id, 'Dummy');

    if (activeTab !== eventKey) {
        return null;
    }

    return gap ? <div className={'mt-3'}>{children}</div> : children;
};

ConditionalTabContent.propTypes = {
    id: PropTypes.string.isRequired,
    eventKey: PropTypes.string.isRequired,
    gap: PropTypes.bool,
    children: PropTypes.node.isRequired,
}

export default ConditionalTabContent;
