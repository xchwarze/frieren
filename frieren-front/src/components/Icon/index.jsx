/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

/**
 * Renders an icon component based on the provided name.
 *
 * @param {String} name - The name of the icon.
 * @param {Object} rest - Additional props to be spread
 * @return {ReactElement} The icon component.
 */
const Icon = ({ name, ...rest }) => (
    <i className={`icon-${name}`} {...rest} />
);

Icon.propTypes = {
    name: PropTypes.string.isRequired
};

export default Icon;
