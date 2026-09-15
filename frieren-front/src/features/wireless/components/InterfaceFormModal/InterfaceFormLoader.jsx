/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import PropTypes from 'prop-types';

import Loading from '@src/components/Loading';
import useGetInterfaceConfig from '@src/features/wireless/hooks/useGetInterfaceConfig.js';
import InterfaceForm from './InterfaceForm';

const normalizeEncryption = (enc) => {
    if (!enc || enc === 'none') return 'none';
    if (enc === 'psk2') return 'psk2+ccmp';
    if (enc === 'psk' || enc === 'psk-mixed') return 'psk-mixed+ccmp';
    if (enc === 'sae+ccmp') return 'sae';
    return enc;
};

const ADD_DEFAULTS = {
    ssid: '',
    mode: 'ap',
    network: '',
    encryption: 'none',
    key: '',
    hidden: false,
    disabled: false,
    isManagement: false,
    isRecon: false,
    ieee80211w: '0',
    bssid: '',
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
            network: interfaceConfig?.network ?? '',
            encryption: normalizeEncryption(interfaceConfig?.encryption),
            key: interfaceConfig?.key ?? '',
            hidden: interfaceConfig?.hidden === '1',
            disabled: interfaceConfig?.disabled === '1',
            isManagement: interfaceConfig?.isManagement === '1',
            isRecon: interfaceConfig?.isRecon === '1',
            ieee80211w: interfaceConfig?.ieee80211w || '0',
            bssid: interfaceConfig?.bssid ?? '',
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
