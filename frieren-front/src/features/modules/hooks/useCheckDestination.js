import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Function to utilize a mutation hook to check a destination using the provided module name and size.
 *
 * @return {Function} The mutation hook.
 */
const useCheckDestination = () => (
    useAuthenticatedMutation({
        mutationFn: ({ moduleName, moduleSize }) => fetchPost({
            module: 'modules',
            action: 'checkDestination',
            name: moduleName,
            size: moduleSize,
        }),
    })
);

export default useCheckDestination;
