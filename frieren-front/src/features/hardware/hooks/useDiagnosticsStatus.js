import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { HARDWARE_GET_DIAGNOSTICS_STATUS } from '@src/features/hardware/helpers/queryKeys.js';

/**
 * Retrieves the diagnostics status
 *
 * @return {Object} The result of the query.
 */
const useDiagnosticsStatus = () => (
    useAuthenticatedQuery({
        queryKey: [HARDWARE_GET_DIAGNOSTICS_STATUS],
        queryFn: () => fetchPost({
            module: 'hardware',
            action: 'getDiagnosticsStatus',
        })
    })
);

export default useDiagnosticsStatus;
