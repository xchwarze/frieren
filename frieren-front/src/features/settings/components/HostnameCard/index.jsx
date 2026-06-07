/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import useSetHostname from '@src/features/settings/hooks/useSetHostname';
import { hostnameSchema } from '@src/features/settings/helpers/validationSchemas.js';
import PanelCard from '@src/components/PanelCard';
import SkeletonBar from '@src/components/SkeletonBar';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';

/**
 * Generate a HostnameCard component that allows users to change the hostname.
 *
 * @param {Object} query - The query object containing data related to the hostname.
 * @return {ReactElement} The HostnameCard component.
 */
const HostnameCard = ({ query }) => {
    const { mutateAsync: setHostname } = useSetHostname();

    const defaultValues = {
        hostname: query?.data?.hostname ?? '',
    };

    const renderContent = () => {
        if (query.isLoading) {
            return (
                <>
                    <div className={'mb-3'}>
                        <SkeletonBar width={80} />
                        <div className={'mt-1'}><SkeletonBar width={300} height={38} barHeight={34} /></div>
                    </div>
                    <SkeletonBar width={80} height={38} barHeight={34} />
                </>
            );
        }

        return (
            <FormProvider schema={hostnameSchema} onSubmit={setHostname} defaultValues={defaultValues}>
                <InputField
                    name={'hostname'}
                    label={'Hostname'}
                    placeholder={'Enter the new hostname'}
                />
                <SubmitButton />
            </FormProvider>
        );
    };

    return (
        <PanelCard title={'Change Hostname'} icon={'server'} showRefresh={false}>
            {renderContent()}
        </PanelCard>
    );
};

HostnameCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default HostnameCard;
