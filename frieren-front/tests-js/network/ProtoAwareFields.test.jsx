/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 *
 * The interface form only offered static/dhcp, so a device already running a dhcpv6 `wan6`
 * could not be saved back. `dhcpv6` needs no UCI option beyond the `proto` the helper
 * already writes, so it is now offered alongside the other two. `ProtoAwareFields` used to
 * hide the static addressing inputs by testing for dhcp specifically — which would have
 * shown them for dhcpv6 — and now shows them for the static protocol only. The harness
 * mirrors `InterfaceForm.jsx`: the real `SelectField` sibling registers `proto`, which is
 * what `ProtoAwareFields`'s `useWatch` observes.
 */
import { fireEvent, render, screen } from '@testing-library/react';

import FormProvider from '@src/components/Form/FormProvider';
import SelectField from '@src/components/Form/SelectField';
import ProtoAwareFields from '@src/features/network/components/InterfaceFormModal/ProtoAwareFields.jsx';
import { DEFAULT_PROTO, PROTO_OPTIONS } from '@src/features/network/helpers/constants.js';

const STATIC_FIELD_LABELS = ['IP Address', 'Netmask', 'Gateway', 'DNS'];

const renderProtoAwareFields = (proto = DEFAULT_PROTO) => render(
    <FormProvider
        onSubmit={() => Promise.resolve()}
        defaultValues={{ proto, ipaddr: '', netmask: '', gateway: '', dns: '' }}
    >
        <SelectField name={'proto'} label={'Protocol'} options={PROTO_OPTIONS} />
        <ProtoAwareFields />
    </FormProvider>
);

const queryStaticFields = () => STATIC_FIELD_LABELS.map((label) => screen.queryByLabelText(label));

describe('ProtoAwareFields', () => {
    it('offers dhcpv6 as a selectable protocol', () => {
        renderProtoAwareFields();

        expect(screen.getByRole('option', { name: 'DHCPv6' })).toBeInTheDocument();
    });

    it('renders the static addressing fields for the static protocol', () => {
        renderProtoAwareFields('static');

        queryStaticFields().forEach((field) => expect(field).toBeInTheDocument());
    });

    it('hides the static addressing fields for dhcp', () => {
        renderProtoAwareFields('dhcp');

        queryStaticFields().forEach((field) => expect(field).not.toBeInTheDocument());
    });

    it('hides the static addressing fields for dhcpv6, which also gets its addressing from the network', () => {
        renderProtoAwareFields('dhcpv6');

        queryStaticFields().forEach((field) => expect(field).not.toBeInTheDocument());
    });

    it('drops the static addressing fields when the protocol is switched to dhcpv6', () => {
        renderProtoAwareFields('static');

        fireEvent.change(screen.getByLabelText('Protocol'), { target: { value: 'dhcpv6' } });

        queryStaticFields().forEach((field) => expect(field).not.toBeInTheDocument());
    });
});
