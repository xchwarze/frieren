/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';

import { MODULE_INSTALL_TYPE_INTERNAL, MODULE_INSTALL_TYPE_SD } from '@src/features/modules/helpers/constants.js';
import useInstallModuleDependencies from '@src/hooks/useInstallModuleDependencies.js';
import Button from '@src/components/Button';

/**
 * Render an alert for missing required dependencies.
 *
 * @param {string} module - The current module name
 * @param {string} dependenciesQueryKey - The query key for re fetching dependencies status
 * @param {boolean} show - Flag to determine if the alert should be shown
 * @param {string} message - The message to display in the alert
 * @param {boolean} internalAvailable - Flag indicating if internal installation is available
 * @param {boolean} SDAvailable - Flag indicating if SD card installation is available
 * @return {ReactElement} The rendered DependenciesAlert component
 */
const DependenciesAlert = ({ module, dependenciesQueryKey, show, message, internalAvailable, SDAvailable }) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [showLog, setShowLog] = useState(false);
    const logRef = useRef(null);
    const { install, isPolling, isPending, output, installFailed } =
        useInstallModuleDependencies({ module, dependenciesQueryKey });
    const isLoading = isPending || isPolling;

    const showLogPanel = (showLog || installFailed) && output.length > 0;

    useEffect(() => {
        if (showLogPanel && logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [output, showLogPanel]);

    const handleInstallToSDClick = useCallback(() => {
        setSelectedOption(MODULE_INSTALL_TYPE_SD);
        install({ destination: MODULE_INSTALL_TYPE_SD });
    }, [install, setSelectedOption]);

    const handleInstallInternallyClick = useCallback(() => {
        setSelectedOption(MODULE_INSTALL_TYPE_INTERNAL);
        install({ destination: MODULE_INSTALL_TYPE_INTERNAL });
    }, [install, setSelectedOption]);

    return (
        <Alert show={show} variant={'dark'}>
            <Alert.Heading>
                Required dependencies
            </Alert.Heading>
            <p>
                The required dependencies for this module were not found.
            </p>
            {message && (
                <p>
                    {message}
                </p>
            )}
            {(isLoading || output.length > 0) && (
                <Form.Check
                    type={'switch'}
                    id={'show-install-log'}
                    label={'Show installation log'}
                    checked={showLog}
                    onChange={() => setShowLog(prev => !prev)}
                    className={'mb-2'}
                />
            )}
            {installFailed && (
                <>
                    <hr/>
                    <p>The installation process is completed, but the dependencies are not detected.</p>
                </>
            )}
            {showLogPanel && (
                <pre
                    ref={logRef}
                    className={'bg-dark text-light p-2 rounded small'}
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                >
                    {output}
                </pre>
            )}
            <hr />
            <div className={'d-flex justify-content-end gap-2'}>
                {SDAvailable && (
                    <Button
                        label={'Install to SD Card'}
                        icon={'moon'}
                        variant={'outline-primary'}
                        disabled={isLoading && selectedOption === MODULE_INSTALL_TYPE_INTERNAL}
                        loading={isLoading && selectedOption === MODULE_INSTALL_TYPE_SD}
                        onClick={handleInstallToSDClick}
                    />
                )}
                <Button
                    label={'Install Internally'}
                    icon={'hard-drive'}
                    variant={'outline-primary'}
                    disabled={!internalAvailable || isLoading && selectedOption === MODULE_INSTALL_TYPE_SD}
                    loading={isLoading && selectedOption === MODULE_INSTALL_TYPE_INTERNAL}
                    onClick={handleInstallInternallyClick}
                />
            </div>
        </Alert>
    );
};

DependenciesAlert.propTypes = {
    module: PropTypes.string.isRequired,
    dependenciesQueryKey: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    internalAvailable: PropTypes.bool,
    SDAvailable: PropTypes.bool,
    message: PropTypes.string,
};

export default DependenciesAlert;
