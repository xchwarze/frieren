/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import Loading from '@src/components/Loading';
import useGetInterfaceConfig from '@src/features/wireless/hooks/useGetInterfaceConfig.js';
import { ENCRYPTION_OPTIONS } from '@src/features/wireless/helpers/constants.js';
import InterfaceForm from './InterfaceForm';

const normalizeEncryption = (enc) => {
    if (!enc || enc === 'none') return 'none';
    if (enc === 'psk2') return 'psk2+ccmp';
    if (enc === 'psk' || enc === 'psk-mixed') return 'psk-mixed+ccmp';
    if (enc === 'sae+ccmp') return 'sae';
    const valid = ENCRYPTION_OPTIONS.map(o => o.value);
    return valid.includes(enc) ? enc : 'none';
};

const ADD_DEFAULTS = {
    ssid: '',
    mode: 'ap',
    network: 'lan',
    encryption: 'none',
    key: '',
    hidden: false,
    disabled: false,
    isManagement: false,
    isRecon: false,
};

const InterfaceFormLoader = ({ radio, section, onHide, initialValues, onInterfaceSaved }) => {
    const { data: interfaceConfig, isFetching } = useGetInterfaceConfig(section);

    if (isFetching) {
        return (
            <div className={'text-center py-3'}>
                <Loading size={96} />
            </div>
        );
    }

    const defaultValues = section
        ? {
            ssid: interfaceConfig?.ssid ?? '',
            mode: interfaceConfig?.mode ?? 'ap',
            network: interfaceConfig?.network ?? 'lan',
            encryption: normalizeEncryption(interfaceConfig?.encryption),
            key: interfaceConfig?.key ?? '',
            hidden: interfaceConfig?.hidden === '1',
            disabled: interfaceConfig?.disabled === '1',
            isManagement: interfaceConfig?.isManagement === '1',
            isRecon: interfaceConfig?.isRecon === '1',
        }
        : (initialValues || ADD_DEFAULTS);

    return (
        <InterfaceForm
            radio={radio}
            section={section}
            onHide={onHide}
            defaultValues={defaultValues}
            onInterfaceSaved={onInterfaceSaved}
        />
    );
};

InterfaceFormLoader.propTypes = {
    radio: PropTypes.string,
    section: PropTypes.string,
    onHide: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    onInterfaceSaved: PropTypes.func,
};

export default InterfaceFormLoader;
