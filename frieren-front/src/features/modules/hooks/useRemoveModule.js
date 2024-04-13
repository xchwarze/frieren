import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { MODULES_GET_MODULE_LIST } from '@src/helpers/queryKeys.js';
import { MODULES_GET_INSTALLED_MODULES } from '@src/features/modules/helpers/queryKeys.js';

/**
 * Custom hook to remove a module.
 *
 * @return {Function} The mutation function to remove a module.
 */
const useRemoveModule = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ moduleName }) => fetchPost({
            module: 'modules',
            action: 'removeModule',
            moduleName: moduleName,
        }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: [MODULES_GET_MODULE_LIST]
            });
            queryClient.invalidateQueries({
                queryKey: [MODULES_GET_INSTALLED_MODULES]
            });

            toast.success(`Module ${variables.moduleName} successfully removed`);
        },
        onError: (error) => {
            toast.error(`Error removing module: ${error?.message || 'Unknown error'}`);
        }
    });
}

export default useRemoveModule;
