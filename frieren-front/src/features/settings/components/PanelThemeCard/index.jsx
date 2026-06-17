/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import useSetPanelTheme from '@src/features/settings/hooks/useSetPanelTheme.js';
import { themeSchema } from '@src/features/settings/helpers/validationSchemas.js';
import PanelCard from '@src/components/PanelCard';
import SkeletonBar from '@src/components/SkeletonBar';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';

const THEMES = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
];

/**
 * Generates a Panel Theme Card component with the ability to change the panel theme.
 *
 * @param {Object} query - The query object containing data for the theme.
 * @return {ReactNode} The Panel Theme Card component.
 */
const PanelThemeCard = ({ query }) => {
    const { mutateAsync: setPanelTheme } = useSetPanelTheme();

    const defaultValues = {
        theme: query?.data?.theme ?? 'auto',
    };

    const renderContent = () => {
        if (query.isLoading) {
            return (
                <>
                    <div className={'mb-3'}>
                        <SkeletonBar width={120} />
                        <div className={'mt-1'}><SkeletonBar width={300} height={38} barHeight={34} /></div>
                    </div>
                    <SkeletonBar width={80} height={38} barHeight={34} />
                </>
            );
        }

        return (
            <FormProvider schema={themeSchema} onSubmit={setPanelTheme} defaultValues={defaultValues}>
                <SelectField
                    name={'theme'}
                    label={'Interface Theme'}
                    options={THEMES}
                />
                <FormActions>
                    <SubmitButton />
                </FormActions>
            </FormProvider>
        );
    };

    return (
        <PanelCard title={'Change Panel Theme'} icon={'aperture'} showRefresh={false}>
            {renderContent()}
        </PanelCard>
    );
};

PanelThemeCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default PanelThemeCard;
