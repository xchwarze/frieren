import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { DASHBOARD_GET_SYSTEM_RESUME } from '@src/features/dashboard/helpers/queryKeys.js';

/**
 * Generate a query to fetch system resume data.
 *
 * @return {Object} The result of the query.
 */
const useSystemResume = () => (
    useAuthenticatedQuery({
        queryKey: [DASHBOARD_GET_SYSTEM_RESUME],
        queryFn: () => fetchPost({
            module: 'dashboard',
            action: 'getSystemResume',
        })
    })
);

export default useSystemResume;
