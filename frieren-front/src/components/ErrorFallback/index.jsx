/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import Card from 'react-bootstrap/Card';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Renders an error fallback component when a crash occurs.
 *
 * @param {Object} error - The error object.
 * @return {ReactElement} The rendered error fallback component.
 */
const ErrorFallback = ({ error }) => (
    <Card border={'danger'} className={'mb-3'} role={'alert'}>
        <Card.Header className={'bg-danger text-white'}>
            <h5>
                <Icon name={'alert-triangle'} /> Something went wrong!
            </h5>
        </Card.Header>
        <Card.Body>
            <p>An unexpected error has occurred. Here&amp;apos;s more detail for debugging:</p>
            <p>Error Message: <strong>{error.message}</strong></p>
            <pre className={'border rounded bg-body-secondary text-danger p-2'}>{error.stack}</pre>
        </Card.Body>
    </Card>
);

ErrorFallback.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string.isRequired,
        stack: PropTypes.string
    }).isRequired,
   //resetErrorBoundary: PropTypes.func.isRequired
};

export default ErrorFallback;
