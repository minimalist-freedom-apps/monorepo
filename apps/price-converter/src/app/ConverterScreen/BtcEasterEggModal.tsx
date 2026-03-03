import { Modal, Text } from '@minimalist-apps/components';
import type { FC } from 'react';

type BtcEasterEggModalOwnProps = {
    readonly open: boolean;
    readonly onOk: () => void;
};

export const BTC_EASTER_EGG_MODAL_CONTENT_TEST_ID = 'BTC_EASTER_EGG_MODAL_CONTENT';
export const BTC_EASTER_EGG_MODAL_OK_BUTTON_TEST_ID = 'BTC_EASTER_EGG_MODAL_OK_BUTTON';
export const BTC_EASTER_EGG_MODAL_STATE_TEST_ID = 'BTC_EASTER_EGG_MODAL_STATE';

/** @publicdep */
export type BtcEasterEggModalDep = {
    BtcEasterEggModal: FC<BtcEasterEggModalOwnProps>;
};

export const BtcEasterEggModal = ({ open, onOk }: BtcEasterEggModalOwnProps) => (
    <>
        <span
            data-testid={BTC_EASTER_EGG_MODAL_STATE_TEST_ID}
            data-open={open ? 'true' : 'false'}
        />
        <Modal
            open={open}
            okText="OK"
            onOk={onOk}
            centered
            showCancel={false}
            closable={false}
            maskClosable={false}
            keyboard={false}
            focusTriggerAfterClose={false}
            destroyOnHidden
            okButtonTestId={BTC_EASTER_EGG_MODAL_OK_BUTTON_TEST_ID}
        >
            {open ? (
                <span data-testid={BTC_EASTER_EGG_MODAL_CONTENT_TEST_ID}>
                    <Text>Fiat currencies inevitably die. Bitcoin cannot be destroyed.</Text>
                </span>
            ) : null}
        </Modal>
    </>
);
