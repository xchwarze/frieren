import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { DASHBOARD_GET_SYSTEM_STATS } from '@src/features/dashboard/helpers/queryKeys.js';

/**
 * Generate a query to fetch system statistics data.
 *
 * @return {Object} The result of the query.
 */
const useSystemStats = () => (
    useAuthenticatedQuery({
        queryKey: [DASHBOARD_GET_SYSTEM_STATS],
        queryFn: () => fetchPost({
            module: 'dashboard',
            action: 'getSystemStats',
        }),

        // milliseconds * seconds
        gcTime: 1000 * 30,
        staleTime: 1000 * 30,
    })
);

export default useSystemStats;
