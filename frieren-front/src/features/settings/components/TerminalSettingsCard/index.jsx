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
import InputField from '@src/components/Form/InputField';
import SelectField from '@src/components/Form/SelectField';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';

const CURSOR_STYLE_OPTIONS = [
    { value: 'block', label: 'Block' },
    { value: 'underline', label: 'Underline' },
    { value: 'bar', label: 'Bar' },
];

const terminalSettingsSchema = yup.object({
    terminalTheme: yup.string().required('Theme selection is mandatory'),
    fontSize: yup.number().min(8, 'Minimum 8').max(32, 'Maximum 32').required('Font size is required'),
    cursorStyle: yup.string().oneOf(['block', 'underline', 'bar']).required(),
    cursorBlink: yup.boolean(),
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
        terminalTheme: query?.data?.terminalTheme,
        fontSize: query?.data?.fontSize,
        cursorStyle: query?.data?.cursorStyle,
        cursorBlink: query?.data?.cursorBlink,
        terminalAutologin: query?.data?.terminalAutologin,
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
                <InputField
                    name={'fontSize'}
                    label={'Font Size'}
                    type={'number'}
                    min={8}
                    max={32}
                />
                <SelectField
                    name={'cursorStyle'}
                    label={'Cursor Style'}
                    options={CURSOR_STYLE_OPTIONS}
                />
                <SwitchField
                    name={'cursorBlink'}
                    label={'Cursor Blink'}
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
