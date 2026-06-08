/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import { useAtom } from 'jotai';
import { useLocation } from 'wouter';
import Form from 'react-bootstrap/Form';
import Button from '@common/components/Button';
import PanelCard from '@common/components/PanelCard';
import { demoCounterAtom, demoPersistedAtom } from '@module/feature/atoms/demoAtoms';

/**
 * State demo card that exercises jotai, jotai/utils (atomWithStorage), and wouter (useLocation).
 *
 * @return {ReactElement} The state demo card component.
 */
const StateDemoCard = () => {
    const [counter, setCounter] = useAtom(demoCounterAtom);
    const [persisted, setPersisted] = useAtom(demoPersistedAtom);
    const [location] = useLocation();

    return (
        <PanelCard title={'State & Routing Demo'} icon={'navigation'} showRefresh={false}>
            <div>
                <div className={'d-flex align-items-center mb-3'}>
                    <strong className={'me-2'}>Jotai atom:</strong>
                    <span className={'me-2'}>Counter: {counter}</span>
                    <Button size={'sm'} variant={'outline-primary'} onClick={() => setCounter(c => c + 1)} label={'Increment'} />
                </div>
                <div className={'d-flex align-items-center mb-3'}>
                    <strong className={'me-2'}>Jotai atomWithStorage:</strong>
                    <Form.Control
                        size={'sm'}
                        type={'text'}
                        className={'d-inline-block w-auto'}
                        value={persisted}
                        onChange={(e) => setPersisted(e.target.value)}
                        placeholder={'Persisted value'}
                    />
                </div>
                <div>
                    <strong className={'me-2'}>Wouter location:</strong>
                    <code>{location}</code>
                </div>
            </div>
        </PanelCard>
    );
};

export default StateDemoCard;
