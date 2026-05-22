/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';
import PropTypes from 'prop-types';

import useSetTerminalAutologin from '@src/features/settings/hooks/useSetTerminalAutologin.js';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import SwitchField from '@src/components/Form/SwitchField';
import SubmitButton from '@src/components/Form/SubmitButton';

const terminalSettingsSchema = yup.object({
    terminalAutologin: yup.boolean(),
}).required();

/**
 * Settings card for terminal configuration options.
 *
 * @param {Object} query - The query object containing terminal settings data.
 * @return {ReactNode} The Terminal Settings Card component.
 */
const TerminalSettingsCard = ({ query }) => {
    const { mutateAsync: setTerminalAutologin } = useSetTerminalAutologin();

    const defaultValues = {
        terminalAutologin: query?.data?.terminalAutologin ?? false,
    };

    return (
        <PanelCard
            title={'Terminal Settings'}
            query={query}
            showRefresh={false}
        >
            <FormProvider schema={terminalSettingsSchema} onSubmit={setTerminalAutologin} defaultValues={defaultValues}>
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
