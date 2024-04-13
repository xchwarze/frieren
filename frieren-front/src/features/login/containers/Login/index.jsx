import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import * as yup from 'yup';

import '@src/features/login/assets/styles.css';
import useUserLoginMutation from '@src/features/login/hooks/useUserLogin.js';
import FormProvider from '@src/components/Form/FormProvider';
import InputField from '@src/components/Form/InputField';
import SubmitButton from '@src/components/Form/SubmitButton';

const schema = yup.object({
  username: yup.string().required('The username is mandatory'),
  password: yup.string().required('The password is mandatory')
}).required();

/**
 * Generates the login form component with username and password fields.
 *
 * @return {ReactElement} The login form component
 */
const Login = () => {
  const { mutateAsync: loginMutation } = useUserLoginMutation();

  return (
      <div className={'vh-100 d-flex justify-content-center align-items-center login-background position-relative'}>
        <div className={'position-absolute top-0 start-0 end-0 bottom-0 bg-dark bg-opacity-25'} />
        <Col lg={4} md={6} sm={8} xs={10} className={'position-relative z-index-1'}>
          <Card>
            <Card.Body className={'p-4 m-1'}>
              <Card.Title>Login</Card.Title>
              <FormProvider schema={schema} onSubmit={loginMutation}>
                <InputField
                    name={'username'}
                    label={'Username'}
                    placeholder={'Login username'}
                />
                <InputField
                    name={'password'}
                    label={'Password'}
                    type={'password'}
                    placeholder={'Account password'}
                />
                <SubmitButton />
              </FormProvider>
            </Card.Body>
          </Card>
        </Col>
      </div>
  );
};

export default Login;
