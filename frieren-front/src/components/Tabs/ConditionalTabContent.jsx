/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import useActiveTab from '@src/hooks/useActiveTab.js';

/**
 * Renders the tab children content based on the active tab state.
 *
 * @param {String} id - The identifier of the tabs.
 * @param {String} eventKey - The key of the event triggering the tab.
 * @param {Object} children - The content to be rendered.
 * @return {ReactElement} The rendered children content or null.
 */
const ConditionalTabContent = ({ id, eventKey, children }) => {
    const { activeTab } = useActiveTab(id, 'Dummy');

    return activeTab === eventKey ? <>{children}</> : null;
};

ConditionalTabContent.propTypes = {
    id: PropTypes.string.isRequired,
    eventKey: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}

export default ConditionalTabContent;
