import { Modal as AntModal } from 'antd';
import type { ReactNode } from 'react';

interface ModalProps {
    readonly open: boolean;
    readonly title?: ReactNode;
    readonly children?: ReactNode;
    readonly onOk?: () => void;
    readonly onCancel?: () => void;
    readonly okText?: string;
    readonly cancelText?: string;
    readonly okDanger?: boolean;
    readonly centered?: boolean;
}

export const Modal = ({
    open,
    title,
    children,
    onOk,
    onCancel,
    okText,
    cancelText,
    okDanger = false,
    centered = false,
}: ModalProps) => (
    <AntModal
        open={open}
        {...(title !== undefined ? { title } : {})}
        {...(onOk !== undefined ? { onOk } : {})}
        {...(onCancel !== undefined ? { onCancel } : {})}
        {...(okText !== undefined ? { okText } : {})}
        {...(cancelText !== undefined ? { cancelText } : {})}
        okButtonProps={{
            ...(okDanger ? { danger: true } : {}),
            style: { boxShadow: 'none' },
        }}
        centered={centered}
    >
        {children}
    </AntModal>
);
