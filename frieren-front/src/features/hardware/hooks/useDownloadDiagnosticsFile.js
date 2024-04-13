import useAuthenticatedMutation from '@src/hooks/useAuthenticatedMutation.js';
import { fetchPostDownload } from '@src/services/fetchService.js';

/**
 * Generates a function that initiates a POST request to download a diagnostics file.
 *
 * @return {Function} A function that when called, sends a POST request to download the diagnostics file.
 */
const useDownloadDiagnosticsFile = () => (
    useAuthenticatedMutation({
        mutationFn: () => fetchPostDownload({
            module: 'hardware',
            action: 'downloadDiagnosticsFile',
        })
    })
);

export default useDownloadDiagnosticsFile;
