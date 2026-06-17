/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback } from 'react';

import useUpdateUserPassword from '@src/features/settings/hooks/useUpdateUserPassword';
import { updatePasswordSchema } from '@src/features/settings/helpers/validationSchemas.js';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';
import FormActions from '@src/components/FormActions';

const defaultValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

/**
 * Update the user's password card component.
 *
 * @return {ReactElement} The user password card component
 */
const UpdateUserPasswordCard = () => {
    const { mutateAsync: updateUserPassword } = useUpdateUserPassword();

    const handleSubmit = useCallback(async (values, { reset }) => {
        await updateUserPassword(values);
        reset(defaultValues);
    }, [updateUserPassword]);

    return (
        <PanelCard
            title={'User Management'}
            icon={'lock'}
            showRefresh={false}
        >
            <FormProvider autoComplete={'off'} schema={updatePasswordSchema} onSubmit={handleSubmit} defaultValues={defaultValues}>
                <InputField
                    name={'currentPassword'}
                    label={'Current Password'}
                    type={'password'}
                    placeholder={'Enter current password'}
                />
                <InputField
                    name={'newPassword'}
                    label={'New Password'}
                    type={'password'}
                    placeholder={'Enter new password'}
                />
                <InputField
                    name={'confirmPassword'}
                    label={'Confirm New Password'}
                    type={'password'}
                    placeholder={'Confirm new password'}
                />
                <FormActions>
                    <SubmitButton />
                </FormActions>
            </FormProvider>
        </PanelCard>
    );
};

export default UpdateUserPasswordCard;
