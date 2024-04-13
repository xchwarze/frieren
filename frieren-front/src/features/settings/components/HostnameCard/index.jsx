import * as yup from 'yup';
import PropTypes from 'prop-types';

import useSetHostname from '@src/features/settings/hooks/useSetHostname';
import PanelCard from '@src/components/PanelCard';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';

const hostnameSchema = yup.object({
    hostname: yup.string().required('Hostname is mandatory')
}).required();

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

    return (
        <PanelCard
            title={'Change Hostname'}
            query={query}
            showRefresh={false}
        >
            <FormProvider schema={hostnameSchema} onSubmit={setHostname} defaultValues={defaultValues}>
                <InputField
                    name={'hostname'}
                    label={'Hostname'}
                    placeholder={'Enter the new hostname'}
                />
                <SubmitButton />
            </FormProvider>
        </PanelCard>
    );
};

HostnameCard.propTypes = {
    query: PropTypes.object.isRequired,
};

export default HostnameCard;
