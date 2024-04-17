/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

/**
 * Renders an ModuleIcon component based on the provided name and module.
 *
 * @param {String} name - The name of the icon.
 * @param {String} module - The module name.
 * @param {Object} rest - Additional props to be spread
 * @return {ReactElement} The icon component.
 */
const ModuleIcon = ({ name, module, ...rest }) => {
    if (name.endsWith('.svg') || name.endsWith('.png')) {
        const modulesFolder = import.meta.env.VITE_WEB_MODULES_FOLDER;
        const src = `${window.location.origin}/${modulesFolder}/${module}/${name}`;
        return (
            <img alt={''} src={src} className={'icon-svg'} {...rest} />
        );
    }

    return (
        <i className={`icon-${name}`} {...rest} />
    );
}

ModuleIcon.propTypes = {
    name: PropTypes.string.isRequired,
    module: PropTypes.string.isRequired,
};

export default ModuleIcon;
