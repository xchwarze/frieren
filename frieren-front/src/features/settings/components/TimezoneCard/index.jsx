/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import { TIMEZONES } from '@src/features/settings/helpers/timezones';
import useSetTimezone from '@src/features/settings/hooks/useSetTimezone.js';
import { timezoneSchema } from '@src/features/settings/helpers/validationSchemas.js';
import SyncFromBrowserButton from '@src/features/settings/components/SyncFromBrowserButton';
import PanelCard from '@src/components/PanelCard';
import SkeletonBar from '@src/components/SkeletonBar';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';

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

    const renderContent = () => {
        if (query.isLoading) {
            return (
                <>
                    <div className={'mb-3'}>
                        <SkeletonBar width={80} />
                        <div className={'mt-1'}><SkeletonBar width={300} height={38} barHeight={34} /></div>
                    </div>
                    <div className={'d-flex justify-content-end gap-2 mt-3'}>
                        <SkeletonBar width={80} height={38} barHeight={34} />
                        <SkeletonBar width={38} height={38} barHeight={34} />
                    </div>
                </>
            );
        }

        return (
            <FormProvider schema={timezoneSchema} onSubmit={setTimezone} defaultValues={defaultValues}>
                <SelectField
                    name={'timezone'}
                    label={'Timezone'}
                    options={TIMEZONES}
                />
                <FormActions>
                    <SubmitButton />
                    <SyncFromBrowserButton />
                </FormActions>
            </FormProvider>
        );
    };

    return (
        <PanelCard title={'Change Timezone'} icon={'clock'} showRefresh={false}>
            {renderContent()}
        </PanelCard>
    );
};

TimezoneCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default TimezoneCard;
