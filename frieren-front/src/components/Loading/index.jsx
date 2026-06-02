/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import loadingImage from '@src/assets/loading.png';

/**
 * Renders the spinning loading image.
 *
 * @param {Number} size - Width and height in pixels (default 200).
 * @param {String} className - Extra classes appended to the spin animation.
 * @param {Object} rest - Additional props spread onto the image.
 * @return {ReactElement} The loading component.
 */
const Loading = ({ size = 200, className = '', ...rest }) => (
    <img
        src={loadingImage}
        alt={'Loading'}
        width={size}
        height={size}
        className={`icon-spin loading-image ${className}`.trim()}
        {...rest}
    />
);

Loading.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
};

export default Loading;
