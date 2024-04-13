/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';
import PropTypes from 'prop-types';

import { TIMEZONES } from '@src/features/settings/helpers/timezones';
import useSetTimezone from '@src/features/settings/hooks/useSetTimezone.js';
import SyncFromBrowserButton from '@src/features/settings/components/SyncFromBrowserButton';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SubmitButton from '@src/components/Form/SubmitButton';

const timezoneSchema = yup.object({
    timezone: yup.string().required('Timezone is mandatory')
}).required();

/**
 * Generate a timezone card component with the ability to change the timezone.
 *
 * @param {Object} query - The query object containing data related to the timezone.
 * @return {ReactElement} The TimezoneCard component.
 */
const TimezoneCard = ({ query }) => {
    const { mutateAsync: setTimezone } = useSetTimezone();

    const defaultValues = {
        timezone: query?.data?.timezone ?? '',
    };

    return (
        <PanelCard
            title={'Change Timezone'}
            query={query}
            showRefresh={false}
        >
            <FormProvider schema={timezoneSchema} onSubmit={setTimezone} defaultValues={defaultValues}>
                <SelectField
                    name={'timezone'}
                    label={'Timezone'}
                    options={TIMEZONES}
                />
                <div className={'d-flex'}>
                    <SubmitButton />
                    <SyncFromBrowserButton />
                </div>
            </FormProvider>
        </PanelCard>
    );
};

TimezoneCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default TimezoneCard;
