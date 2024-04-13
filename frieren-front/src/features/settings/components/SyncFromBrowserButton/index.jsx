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
