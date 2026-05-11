/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders a panel card component with a title, optional subtitle, and optional refresh button.
 *
 * @param {String} title - The title of the panel card.
 * @param {String} [subtitle] - The optional subtitle of the panel card.
 * @param {Boolean} [showRefresh=true] - Whether to show the refresh button.
 * @param {Object} [query] - The query object used for fetching data.
 * @param {Function} [refetch] - Optional refetch function.
 * @param {Boolean} [isFetching] - Optional isFetching state.
 * @param {ReactNode} children - The content to render inside the panel card.
 * @param {Object} rest - Additional options for Card component using spread syntax.
 * @return {ReactNode} The rendered panel card component.
 */
const PanelCard = ({
                       title,
                       subtitle,
                       showRefresh = true,
                       query,
                       refetch,
                       isFetching,
                       isLoading,
                       children,
                       ...rest
                   }) => {
    const handleReFetch = refetch || (query && query.refetch);
    const currentlyFetching = isFetching !== undefined ? isFetching : (query && query.isFetching);
    const currentlyLoading = isLoading !== undefined ? isLoading : (query && query.isLoading);

    return (
        <Card {...rest}>
            <Card.Body>
                <Card.Title className={'card-title'}>
                    {title}
                    {showRefresh && (
                        <Button
                            variant={'outline-secondary'}
                            disabled={currentlyFetching}
                            onClick={handleReFetch}
                            className={'btn-icon'}
                        >
                            <Icon name={`refresh-cw ${currentlyFetching ? 'icon-spin' : ''}`} />
                        </Button>
                    )}
                </Card.Title>

                {subtitle && (
                    <Card.Subtitle className={'mb-3 text-muted'}>
                        {subtitle}
                    </Card.Subtitle>
                )}

                {currentlyLoading && (
                    <div className={'text-center'}>
                        <Spinner animation={'border'} />
                    </div>
                )}

                {children}
            </Card.Body>
        </Card>
    );
};

PanelCard.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    showRefresh: PropTypes.bool,
    query: PropTypes.object,
    refetch: PropTypes.func,
    isFetching: PropTypes.bool,
    isLoading: PropTypes.bool,
    children: PropTypes.any.isRequired,
};

export default PanelCard;
