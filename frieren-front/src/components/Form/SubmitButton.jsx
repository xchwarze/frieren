/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import { useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';

import Button from '@src/components/Button';

/**
 * Renders a submit button component with an optional label and a loading spinner when the form is submitting.
 *
 * @param {String} label - The label for the submit button. Defaults to 'Submit'.
 * @param {String} icon - The name of the icon to display on the button.
 * @param {Object} rest - Additional props to be spread on the component.
 * @return {ReactElement} The rendered submit button component.
 */
const SubmitButton = ({ label = 'Save', icon = 'save', ...rest }) => {
    const { formState: { isSubmitting } } = useFormContext();

    return (
        <Button
            variant={'primary'}
            type={'submit'}
            label={label}
            icon={icon}
            loading={isSubmitting}
            {...rest}
        />
    );
};

SubmitButton.propTypes = {
    label: PropTypes.string,
    icon: PropTypes.string,
};

export default SubmitButton;
