import { Modal, Text } from '@minimalist-apps/components';
import type { FC } from 'react';

type RemoveCurrencyModalOwnProps = {
    readonly code: string;
    readonly open: boolean;
    readonly onOk: () => void;
    readonly onCancel: () => void;
};

/** @publicdep */
export type RemoveCurrencyModalDep = {
    RemoveCurrencyModal: FC<RemoveCurrencyModalOwnProps>;
};

export const RemoveCurrencyModal = ({
    code,
    open,
    onOk,
    onCancel,
}: RemoveCurrencyModalOwnProps) => (
    <Modal
        open={open}
        title="Remove currency?"
        okText="Remove"
        cancelText="Cancel"
        onOk={onOk}
        onCancel={onCancel}
        okDanger
        centered
    >
        <Text>Do you want to remove {code}?</Text>
    </Modal>
);
