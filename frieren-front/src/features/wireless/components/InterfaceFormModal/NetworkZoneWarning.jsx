/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useWatch } from 'react-hook-form';
import { Alert } from 'react-bootstrap';

// The network zones a client (sta) interface is normally expected to route through.
const EXPECTED_STA_NETWORKS = ['wan', 'wan6', 'wwan'];

/**
 * Warns when a client (sta) interface is about to be bound to a network zone other
 * than wan/wan6/wwan. The Network select has no fixed default, so it lands on
 * whatever interface the backend lists first -- easy to leave it on the wrong zone
 * (e.g. lan) by mistake, which silently bridges the uplink instead of routing it.
 */
const NetworkZoneWarning = () => {
    const mode = useWatch({ name: 'mode' });
    const network = useWatch({ name: 'network' });

    if (mode !== 'sta' || !network || EXPECTED_STA_NETWORKS.includes(network)) {
        return null;
    }

    return (
        <Alert variant={'warning'}>
            Network is set to <strong>{network}</strong>. For a client connection this
            usually belongs on <strong>wan</strong>/<strong>wan6</strong>/<strong>wwan</strong>
            {' '}instead -- double-check before saving.
        </Alert>
    );
};

export default NetworkZoneWarning;
