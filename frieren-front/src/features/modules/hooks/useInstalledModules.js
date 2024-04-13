import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

/**
 * A custom hook to fetch the installed modules.
 *
 * @return {Object} The result of the query.
 */
const useInstalledModules = () => (
    useAuthenticatedQuery({
        queryKey: [MODULES_GET_INSTALLED_MODULES],
        queryFn: () => fetchPost({
            module: 'modules',
            action: 'getInstalledModules',
        })
    })
);

export default useInstalledModules;
