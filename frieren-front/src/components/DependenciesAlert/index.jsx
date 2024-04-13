import { useCallback, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useAtomValue } from 'jotai';
import PropTypes from 'prop-types';

import { dependencyInstallStatusAtom } from '@src/atoms/dependencyInstallStatusAtom.js';
import useInstallModuleDependencies from '@src/hooks/useInstallModuleDependencies.js';
import Button from '@src/components/Button';

const TYPE_SD = 'sd';
const TYPE_INTERNAL = 'internal';

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
    const [selectedOption, setSelectedOption] = useState('')
    const { isRunning, hasDependencies, logContent } = useAtomValue(dependencyInstallStatusAtom);
    const { mutate: installDependencies, isPending: installDependenciesRunning } =
        useInstallModuleDependencies({ module, dependenciesQueryKey });
    const isLoading = installDependenciesRunning || isRunning;
    const hasLog = hasDependencies === false && logContent.length > 0;

    const handleInstallToSDClick = useCallback(() => {
        setSelectedOption(TYPE_SD);
        installDependencies({
            destination: TYPE_SD
        });
    }, [installDependencies, setSelectedOption]);

    const handleInstallInternallyClick = useCallback(() => {
        setSelectedOption(TYPE_INTERNAL);
        installDependencies({
            destination: ''
        });
    }, [installDependencies, setSelectedOption]);

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
            {hasLog && (
                <>
                    <hr/>
                    <p>The installation process is completed, but the dependencies are not detected.</p>
                    <pre>{logContent}</pre>
                </>
            )}
            <hr />
            <div className={'d-flex justify-content-end gap-2'}>
                {SDAvailable && (
                    <Button
                        label={'Install to SD Card'}
                        icon={'moon'}
                        variant={'outline-primary'}
                        disabled={isLoading && selectedOption === TYPE_INTERNAL}
                        loading={isLoading && selectedOption === TYPE_SD}
                        onClick={handleInstallToSDClick}
                    />
                )}
                <Button
                    label={'Install Internally'}
                    icon={'hard-drive'}
                    variant={'outline-primary'}
                    disabled={!internalAvailable || isLoading && selectedOption === TYPE_SD}
                    loading={isLoading && selectedOption === TYPE_INTERNAL}
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
