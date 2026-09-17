/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';
import { Alert } from 'react-bootstrap';

// 'wan'/'wan6' already belong to the ethernet uplink device -- 'wwan' is the
// dedicated, device-less network a wifi client interface is meant to claim.
const EXPECTED_STA_NETWORK = 'wwan';

/**
 * Warns when a client (sta) interface is about to be bound to anything other than
 * `wwan`. The Network select has no fixed default, so it lands on whatever interface
 * the backend lists first -- easy to leave it on the wrong zone by mistake (even
 * `wan` itself is wrong here: it's already claimed by the ethernet port).
 */
const NetworkZoneWarning = () => {
    const mode = useWatch({ name: 'mode' });
    const network = useWatch({ name: 'network' });

    if (mode !== 'sta' || !network || network === EXPECTED_STA_NETWORK) {
        return null;
    }

    return (
        <Alert variant={'warning'}>
            Network is set to <strong>{network}</strong>. For a client connection this
            usually belongs on <strong>wwan</strong> instead -- double-check before saving.
        </Alert>
    );
};

export default NetworkZoneWarning;
