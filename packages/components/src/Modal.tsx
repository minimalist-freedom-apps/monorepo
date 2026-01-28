import { Modal as AntModal } from 'antd';
import type { ReactNode } from 'react';
import { BRAND_COLORS } from './colors';

interface ModalProps {
    readonly open: boolean;
    readonly title: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
}

export const Modal = ({ open, title, onClose, children }: ModalProps) => (
    <AntModal
        title={title}
        open={open}
        onCancel={onClose}
        footer={null}
        styles={{
            content: { background: BRAND_COLORS.backgroundDark },
            header: { background: BRAND_COLORS.backgroundDark },
        }}
    >
        {children}
    </AntModal>
);
