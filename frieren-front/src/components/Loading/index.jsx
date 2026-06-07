/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

/**
 * Renders the spinning loading image.
 *
 * The image asset is provided at runtime via window.Frieren.loadingImage (set by
 * umdSupport on the host) instead of being imported here, so module UMD bundles
 * that use this component don't each inline a base64 copy of the PNG.
 *
 * @param {Number} size - Width and height in pixels (default 200).
 * @param {String} spinClassName - Spin animation class (default 'icon-spin-slow', 4s).
 * @param {String} className - Extra classes appended to the spin animation.
 * @param {Object} rest - Additional props spread onto the image.
 * @return {ReactElement} The loading component.
 */
const Loading = ({ size = 200, spinClassName = 'icon-spin-slow', className = '', ...rest }) => (
    <img
        src={window.Frieren.loadingImage}
        alt={''}
        aria-hidden={'true'}
        width={size}
        height={size}
        className={`${spinClassName} loading-image ${className}`.trim()}
        {...rest}
    />
);

Loading.propTypes = {
    size: PropTypes.number,
    spinClassName: PropTypes.string,
    className: PropTypes.string,
};

export default Loading;
