/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';
import PropTypes from 'prop-types';

import { TERMINAL_THEME_OPTIONS } from '@src/features/terminal/helpers/terminalThemes.js';
import useSetTerminalSettings from '@src/features/settings/hooks/useSetTerminalSettings.js';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';

const terminalSettingsSchema = yup.object({
    terminalTheme: yup.string().required('Theme selection is mandatory'),
    terminalAutologin: yup.boolean(),
}).required();

/**
 * Settings card for terminal configuration options.
 *
 * @param {Object} query - The query object containing terminal settings data.
 * @return {ReactNode} The Terminal Settings Card component.
 */
const TerminalSettingsCard = ({ query }) => {
    const { mutateAsync: setTerminalSettings } = useSetTerminalSettings();

    const defaultValues = {
        terminalTheme: query?.data?.terminalTheme ?? 'default',
        terminalAutologin: query?.data?.terminalAutologin ?? false,
    };

    return (
        <PanelCard
            title={'Terminal Settings'}
            query={query}
            showRefresh={false}
        >
            <FormProvider schema={terminalSettingsSchema} onSubmit={setTerminalSettings} defaultValues={defaultValues}>
                <SelectField
                    name={'terminalTheme'}
                    label={'Terminal Theme'}
                    options={TERMINAL_THEME_OPTIONS}
                />
                <SwitchField
                    name={'terminalAutologin'}
                    label={'Use Autologin'}
                />
                <SubmitButton />
            </FormProvider>
        </PanelCard>
    );
};

TerminalSettingsCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default TerminalSettingsCard;
