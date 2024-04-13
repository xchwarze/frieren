import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';

/**
 * Retrieves the list of modules.
 *
 * @return {Object} The result of the authenticated query.
 */
const useModulesList = () => (
    useAuthenticatedQuery({
        queryKey: [MODULES_GET_MODULE_LIST],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'getModuleList',
        }),

        // milliseconds * seconds * minutes * hours
        gcTime: 1000 * 60 * 60 * 12,
        staleTime: 1000 * 60 * 60 * 12,
    })
);

export default useModulesList;
