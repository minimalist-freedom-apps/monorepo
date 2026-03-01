import { Modal, Text } from '@minimalist-apps/components';
import type { FC } from 'react';

type BtcEasterEggModalOwnProps = {
    readonly open: boolean;
    readonly onOk: () => void;
};

/** @publicdep */
export type BtcEasterEggModalDep = {
    BtcEasterEggModal: FC<BtcEasterEggModalOwnProps>;
};

export const BtcEasterEggModal = ({ open, onOk }: BtcEasterEggModalOwnProps) => (
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
    >
        <Text>Fiat currencies inevitably die. Bitcoin cannot be destroyed.</Text>
    </Modal>
);
