/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Card from 'react-bootstrap/Card';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';
import Button from '@src/components/Button';

// Only the header-actions variant may wrap: a wide action set then drops below the title instead
// of widening the card past its container on narrow screens. Without actions the title row stays
// the legacy single non-wrapping row, so existing cards render exactly as before.
const TITLE_ROW_CLASS = 'panel-card-title';
const TITLE_ROW_WITH_ACTIONS_CLASS = `${TITLE_ROW_CLASS} flex-wrap gap-2`;

/**
 * Panel card with a title, optional subtitle, and optional refresh button.
 *
 * Owns the title→content gap (the header block carries `mb-4`) so consumers
 * never add a top margin to their first child to compensate. Card-to-card
 * spacing is the container's job (use a `gap-*` wrapper), not the card's.
 *
 * @param {String} title - The title of the panel card.
 * @param {String} [icon] - Optional leading icon name (feather) shown before the title.
 * @param {String} [subtitle] - Optional descriptive subtitle.
 * @param {ReactNode} [headerActions] - Optional actions rendered beside the refresh button. The
 *   group wraps (and drops below the title) when the card is too narrow to hold them in one row.
 * @param {Function} [refetch] - Refetch handler for the refresh button.
 * @param {Boolean} [showRefresh] - Whether to show the refresh button. Defaults to whether
 *   `refetch` was passed (`!!refetch`), so a card with no refetch handler renders no button
 *   unless explicitly opted in with `showRefresh={true}`.
 * @param {Boolean} [isFetching] - Disables and spins the refresh button while fetching.
 * @param {Boolean} [fill=false] - Make the body a flex column so a trailing child with
 *   `mt-auto` anchors to the bottom (pairs with `className="h-100"` for equal-height rows).
 * @param {ReactNode} [children] - The content to render inside the panel card. Callers with a
 *   loading/error/idle state that renders nothing yet may legitimately pass `null`.
 * @param {Object} rest - Additional props forwarded to the Card root (e.g. className).
 * @return {ReactNode} The rendered panel card component.
 */
const PanelCard = ({
                        title,
                        icon,
                        subtitle,
                        headerActions,
                        refetch,
                        showRefresh = !!refetch,
                        isFetching,
                        fill = false,
                        className = '',
                        children,
                        ...rest
                   }) => {
    const refreshButton = showRefresh && (
        <Button
            variant={'outline-secondary'}
            disabled={isFetching}
            onClick={refetch}
            className={'btn-icon'}
            icon={`refresh-cw ${isFetching ? 'icon-spin' : ''}`}
            title={'Refresh'}
        />
    );

    return (
        <Card className={`panel-card ${className}`.trim()} {...rest}>
            <Card.Body className={fill ? 'd-flex flex-column' : undefined}>
                <div className={'mb-4'}>
                    <Card.Title className={headerActions ? TITLE_ROW_WITH_ACTIONS_CLASS : TITLE_ROW_CLASS}>
                        <span className={'d-inline-flex align-items-center gap-2'}>
                            {icon && <Icon name={icon} />}
                            {title}
                        </span>
                        {headerActions ? (
                            <div className={'d-flex flex-wrap align-items-center gap-2'}>
                                {headerActions}
                                {refreshButton}
                            </div>
                        ) : refreshButton}
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
};

PanelCard.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
    subtitle: PropTypes.node,
    headerActions: PropTypes.node,
    showRefresh: PropTypes.bool,
    refetch: PropTypes.func,
    isFetching: PropTypes.bool,
    fill: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default PanelCard;
