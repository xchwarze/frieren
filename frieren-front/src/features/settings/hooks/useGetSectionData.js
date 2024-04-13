/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useAuthenticatedQuery from '@src/hooks/useAuthenticatedQuery.js';
import { fetchPost } from '@src/services/fetchService.js';
import { SETTINGS_GET_FORM_VALUES } from '@src/features/settings/helpers/queryKeys.js';

/**
 * Retrieves advanced data using the useAuthenticatedQuery hook.
 *
 * @return {Object} The result of the query.
 */
const useGetSectionData = () => (
    useAuthenticatedQuery({
        queryKey: [SETTINGS_GET_FORM_VALUES],
        queryFn: () => fetchPost({
            module: 'settings',
            action: 'getSectionData',
        }),
    })
);

export default useGetSectionData;
