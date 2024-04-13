/*
 * Project: Frieren Framework
 * Copyright (C) 2023 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * More info at: https://github.com/xchwarze/frieren
 */
import useSetDatetimeFromBrowser from '@src/features/settings/hooks/useSetDatetimeFromBrowser';
import Button from '@src/components/Button';

/**
 * Rendering a button to sync datetime from the browser.
 *
 * @return {ReactElement} The rendered button component
 */
const SyncFromBrowserButton = () => {
    const { mutate, isPending } = useSetDatetimeFromBrowser();

    return (
        <Button
            label={'Sync from Browser'}
            icon={'clock'}
            variant={'secondary'}
            onClick={mutate}
            loading={isPending}
            className={'ms-2'}
        />
    );
};

export default SyncFromBrowserButton;
