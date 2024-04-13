import { Card } from 'react-bootstrap';
import * as yup from 'yup';

import useUpdateUserPassword from '@src/features/settings/hooks/useUpdateUserPassword';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';

const updateSchema = yup.object({
    currentPassword: yup.string().required('Current password is mandatory'),
    newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is mandatory'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match')
}).required();

/**
 * Update the user's password card component.
 *
 * @return {ReactElement} The user password card component
 */
const UpdateUserPasswordCard = () => {
    const { mutateAsync: updateUserPassword } = useUpdateUserPassword();

    const defaultValues = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    return (
        <Card>
            <Card.Body>
                <Card.Title className={'card-title'}>
                    User Management
                </Card.Title>
                <FormProvider autoComplete={'off'} schema={updateSchema} onSubmit={updateUserPassword} defaultValues={defaultValues}>
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
                    <SubmitButton />
                </FormProvider>
            </Card.Body>
        </Card>
    );
};

export default UpdateUserPasswordCard;
