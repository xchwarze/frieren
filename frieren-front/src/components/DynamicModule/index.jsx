/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import useScript from '@src/hooks/useScript';
import { ucfirst } from '@src/helpers/actionsHelper.js';
import Icon from '@src/components/Icon';

// From frieren-module-template/vite.config.js
const FRIEREN_MODULE_PREFIX = 'FrierenModule';

/**
 * Renders a dynamic module based on the provided module name and title.
 *
 * @param {String} name - The name of the module.
 * @return {ReactElement} The rendered dynamic module.
 */
const DynamicModule = ({ name }) => {
    const modulesFolder = import.meta.env.VITE_WEB_ROOT_FOLDER;
    const src = `${window.location.origin}/${modulesFolder}/${name}/module.umd.js`;
    const libraryName =  FRIEREN_MODULE_PREFIX + ucfirst(name);
    const { status, retry } = useScript(src);

    if (status === 'loading') {
        return (
            <Alert variant={'info'}>
                <Spinner size={'sm'} animation={'border'} variant={'info'} className={'me-3'} />
                Loading module...
            </Alert>
        );
    } else if (status === 'error') {
        return (
            <Alert variant={'danger'}>
                <Icon name={'alert-triangle'} /> Module not found or not available. This error is commonly caused because the .js was not found in the path where it should be.
                <Button size={'sm'} variant={'outline-danger'} onClick={retry} className={'ms-3'}>Retry</Button>
            </Alert>
        );
    } else if (typeof window[libraryName] !== 'function') {
        return (
            <Alert variant={'danger'}>
                <Icon name={'alert-triangle'} /> Error executing module: Function not found. This error is caused by a configuration or build error in the module.
                <Button size={'sm'} variant={'outline-danger'} onClick={retry} className={'ms-3'}>Retry</Button>
            </Alert>
        );
    }

    return window[libraryName]();
};

DynamicModule.propTypes = {
    name: PropTypes.string.isRequired,
};

export default DynamicModule;
