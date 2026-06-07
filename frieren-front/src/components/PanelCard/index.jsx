/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Panel card with a title, optional subtitle, and optional refresh button.
 *
 * Owns the title→content gap (the header block carries `mb-3`) so consumers
 * never add a top margin to their first child to compensate. Card-to-card
 * spacing is the container's job (use a `gap-*` wrapper), not the card's.
 *
 * @param {String} title - The title of the panel card.
 * @param {String} [subtitle] - Optional descriptive subtitle.
 * @param {Boolean} [showRefresh=true] - Whether to show the refresh button.
 * @param {Function} [refetch] - Refetch handler for the refresh button.
 * @param {Boolean} [isFetching] - Disables and spins the refresh button while fetching.
 * @param {ReactNode} children - The content to render inside the panel card.
 * @param {Object} rest - Additional props forwarded to the Card root (e.g. className).
 * @return {ReactNode} The rendered panel card component.
 */
const PanelCard = ({
                       title,
                       subtitle,
                       showRefresh = true,
                       refetch,
                       isFetching,
                       className = '',
                       children,
                       ...rest
                   }) => (
    <Card className={`panel-card ${className}`.trim()} {...rest}>
        <Card.Body>
            <div className={'mb-3'}>
                <Card.Title className={'panel-card-title'}>
                    {title}
                    {showRefresh && (
                        <Button
                            variant={'outline-secondary'}
                            disabled={isFetching}
                            onClick={refetch}
                            className={'btn-icon'}
                            aria-label={'Refresh'}
                        >
                            <Icon name={`refresh-cw ${isFetching ? 'icon-spin' : ''}`} />
                        </Button>
                    )}
                </Card.Title>

                {subtitle && (
                    <Card.Subtitle className={'text-body-secondary'}>
                        {subtitle}
                    </Card.Subtitle>
                )}
            </div>

            {children}
        </Card.Body>
    </Card>
);

PanelCard.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    showRefresh: PropTypes.bool,
    refetch: PropTypes.func,
    isFetching: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
};

export default PanelCard;
