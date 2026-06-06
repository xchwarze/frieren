/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';

import InputField from '@src/components/Form/InputField';
import { DEFAULT_PROTO } from '@src/features/network/helpers/constants.js';

/**
 * Renders the protocol-dependent interface fields. Static addressing inputs
 * are hidden when the selected protocol is DHCP.
 *
 * @return {ReactElement|null} The protocol-aware fields.
 */
const ProtoAwareFields = () => {
    const proto = useWatch({ name: 'proto', defaultValue: DEFAULT_PROTO });

    if (proto === 'dhcp') {
        return null;
    }

    return (
        <>
            <InputField name={'ipaddr'} label={'IP Address'} placeholder={'192.168.1.1'} />
            <InputField name={'netmask'} label={'Netmask'} placeholder={'255.255.255.0'} />
            <InputField name={'gateway'} label={'Gateway'} placeholder={'192.168.1.254'} />
            <InputField name={'dns'} label={'DNS'} placeholder={'1.1.1.1'} />
        </>
    );
};

export default ProtoAwareFields;
