/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Badge from 'react-bootstrap/Badge';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders a tab with an icon, title and an optional trailing count badge.
 *
 * @param {String} icon - The name of the icon to display.
 * @param {String} title - The title to display next to the icon.
 * @param {Number} [count] - Optional counter rendered as a trailing badge.
 * @return {ReactElement} A React element representing the tab title.
 */
const TabTitle = ({ icon, title, count }) => (
    <>
        <Icon name={icon} /> {title}
        {count !== undefined && count !== null && (
            <Badge bg={'secondary'} className={'ms-2'}>{count}</Badge>
        )}
    </>
);

TabTitle.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    count: PropTypes.number,
};

export default TabTitle;
