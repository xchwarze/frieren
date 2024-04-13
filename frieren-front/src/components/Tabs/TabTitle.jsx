/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders a tab with an icon and title.
 *
 * @param {String} icon - The name of the icon to display.
 * @param {String} title - The title to display next to the icon.
 * @return {ReactElement} A React element representing the tab title.
 */
const TabTitle = ({ icon, title }) => (
    <>
        <Icon name={icon} /> {title}
    </>
);

TabTitle.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

export default TabTitle;
