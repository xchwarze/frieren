import PropTypes from 'prop-types';

/**
 * Renders an error fallback component when a crash occurs.
 *
 * @param {Object} error - The error object.
 * @return {ReactElement} The rendered error fallback component.
 */
const ErrorFallback = ({ error }) => (
    <div className={'card border-danger mb-3'} role={'alert'}>
        <div className={'card-header bg-danger text-white'}>
            <h5>
                <i className={'bi bi-exclamation-triangle-fill'}></i> Something went wrong!
            </h5>
        </div>
        <div className={'card-body'}>
            <p>An unexpected error has occurred. Here's more detail for debugging:</p>
            <p>Error Message: <strong>{error.message}</strong></p>
            <pre className={'border rounded bg-light text-danger p-2'}>{error.stack}</pre>
        </div>
    </div>
);

ErrorFallback.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string.isRequired,
        stack: PropTypes.string
    }).isRequired,
   //resetErrorBoundary: PropTypes.func.isRequired
};

export default ErrorFallback;
