/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';
import PropTypes from 'prop-types';

import useSetPanelTheme from '@src/features/settings/hooks/useSetPanelTheme.js';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SubmitButton from '@src/components/Form/SubmitButton';

const themeSchema = yup.object({
    theme: yup.string().required('Theme selection is mandatory')
}).required();

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

    return (
        <PanelCard
            title={'Change Panel Theme'}
            query={query}
            showRefresh={false}
        >
            <FormProvider schema={themeSchema} onSubmit={setPanelTheme} defaultValues={defaultValues}>
                <SelectField
                    name={'theme'}
                    label={'Interface Theme'}
                    options={THEMES}
                />
                <SubmitButton />
            </FormProvider>
        </PanelCard>
    );
};

PanelThemeCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default PanelThemeCard;
