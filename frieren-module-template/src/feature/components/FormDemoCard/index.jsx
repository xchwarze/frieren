/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import * as yup from 'yup';
import { toast } from 'react-toastify';
import PanelCard from '@common/components/PanelCard';
import FormProvider from '@common/components/Form/FormProvider';
import InputField from '@common/components/Form/InputField';
import SwitchField from '@common/components/Form/SwitchField';
import SubmitButton from '@common/components/Form/SubmitButton';

const schema = yup.object({
    name: yup.string().required('Name is required'),
    enabled: yup.boolean(),
});

const defaultValues = {
    name: '',
    enabled: false,
};

/**
 * Form demo card that exercises react-hook-form, @hookform/resolvers/yup, yup, and react-toastify.
 *
 * @return {ReactElement} The form demo card component.
 */
const FormDemoCard = () => {
    const handleSubmit = async (values) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success(`Form submitted: ${values.name} (enabled: ${values.enabled})`);
    };

    return (
        <PanelCard title={'Form Demo'} showRefresh={false}>
            <FormProvider schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
                <InputField name={'name'} label={'Name'} placeholder={'Enter a name'} />
                <SwitchField name={'enabled'} label={'Enable feature'} />
                <SubmitButton label={'Submit'} />
            </FormProvider>
        </PanelCard>
    );
};

export default FormDemoCard;
