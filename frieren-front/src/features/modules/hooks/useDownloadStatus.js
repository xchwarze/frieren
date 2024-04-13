import { useState } from 'react';

import useInterval from '@src/hooks/useInterval';
import { fetchPost } from '@src/services/fetchService.js';

/**
 * Generates a hook to track download status.
 *
 * @param {String} moduleName - The name of the module.
 * @param {String} destination - The destination for the download.
 * @param {String} checksum - The checksum for validation.
 * @param {Boolean} isActive - Flag to indicate if the download is active.
 * @return {Boolean} Returns true when download is complete.
 */
const useDownloadStatus = ({ moduleName, destination, checksum, isActive }) => {
    const [downloadComplete, setDownloadComplete] = useState(false);
    const callback = async () => {
        if (!downloadComplete) {
            const response = await fetchPost({
                module: 'modules',
                action: 'downloadStatus',
                moduleName,
                destination,
                checksum,
            });
            if (response.success) {
                setDownloadComplete(true);
            }
        }
    }
    useInterval(callback, isActive && !downloadComplete ? 2000 : null);

    return downloadComplete;
};

export default useDownloadStatus;
