import { useMutation } from '@tanstack/react-query';

import useHandleError from '@src/hooks/useHandleError.js';

/**
 * Returns a mutation hook that automatically handles authentication errors and provides feedback on errors.
 * Utilizes React Query's useMutation for enhanced state and error management.
 *
 * @param {Function} mutationFn - The mutation function to be executed.
 * @param {{
 *   gcTime?: number | Infinity,
 *   mutationKey?: unknown[],
 *   networkMode?: 'online' | 'always' | 'offlineFirst',
 *   onMutate?: (variables: any) => Promise<any> | any,
 *   onError?: (error: any, variables: any, context?: any) => void,
 *   onSettled?: (data: any | undefined, error: any | null, variables: any, context?: any) => void,
 *   onSuccess?: (data: any, variables: any, context: any) => void,
 *   retry?: boolean | number | ((failureCount: number, error: any) => boolean),
 *   retryDelay?: number | ((retryAttempt: number, error: any) => number),
 *   throwOnError?: boolean,
 *   meta?: Record<string, unknown>
 * }} rest - Additional options accepted by useMutation.
 * @return {{
 *   data: any,
 *   error: any,
 *   isError: boolean,
 *   isIdle: boolean,
 *   isPending: boolean,
 *   isPaused: boolean,
 *   isSuccess: boolean,
 *   failureCount: number,
 *   failureReason: any | null,
 *   mutate: (variables: any, options?: { onSuccess?: Function, onSettled?: Function, onError?: Function }) => void,
 *   mutateAsync: (variables: any, options?: { onSuccess?: Function, onSettled?: Function, onError?: Function }) => Promise<any>,
 *   reset: () => void,
 *   status: 'idle' | 'pending' | 'error' | 'success',
 *   submittedAt: number,
 *   variables: any | undefined
 * }} The mutation object with various properties and methods for mutation state management.
 */
const useAuthenticatedMutation = ({ mutationFn, ...rest }) => {
    const handleError = useHandleError();

    return useMutation({
        mutationFn: async (props) => {
            return await mutationFn(props);
        },
        onError: (error) => handleError(error),
        ...rest,
    });
};

export default useAuthenticatedMutation;
