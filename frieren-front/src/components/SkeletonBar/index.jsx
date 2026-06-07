/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';

import { getSkeletonColors } from '@src/helpers/skeletonHelper.js';

/**
 * Renders a single animated skeleton bar using react-content-loader.
 *
 * @param {number} [width=80] - Width of the skeleton bar.
 * @param {number} [height=18] - Height of the SVG container.
 * @param {number} [barHeight=12] - Height of the bar rect.
 * @return {ReactElement}
 */
const SkeletonBar = ({ width = 80, height = 18, barHeight = 12 }) => {
    const colors = getSkeletonColors();
    const y = Math.round((height - barHeight) / 2);

    return (
        <ContentLoader
            aria-hidden={'true'}
            width={width}
            height={height}
            backgroundColor={colors.background}
            foregroundColor={colors.foreground}
        >
            <rect x={0} y={y} rx={4} ry={4} width={width} height={barHeight} />
        </ContentLoader>
    );
};

SkeletonBar.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    barHeight: PropTypes.number,
};

export default SkeletonBar;
