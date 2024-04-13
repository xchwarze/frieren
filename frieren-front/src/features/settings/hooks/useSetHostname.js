import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * A custom hook for setting the hostname using useMutation.
 *
 * @return {Function} The mutation hook.
 */
const useSetHostname = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ hostname }) => fetchPost({
            module: 'settings',
            action: 'setHostname',
            hostname,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
    });
};

export default useSetHostname;
