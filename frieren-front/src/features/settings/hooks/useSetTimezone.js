import { useQueryClient } from '@tanstack/react-query';

import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Generates a custom hook for setting the timezone.
 *
 * @return {Function} The mutation hook.
 */
const useSetTimezone = () => {
    const queryClient = useQueryClient();

    return useAuthenticatedMutation({
        mutationFn: ({ timezone }) => fetchPost({
            module: 'settings',
            action: 'setTimezone',
            timezone,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [SETTINGS_GET_FORM_VALUES],
            });
        },
    });
};

export default useSetTimezone;
