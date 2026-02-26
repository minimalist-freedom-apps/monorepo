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
    readonly okDisabled?: boolean;
    readonly centered?: boolean;
    readonly showCancel?: boolean;
    readonly closable?: boolean;
    readonly maskClosable?: boolean;
    readonly keyboard?: boolean;
    readonly focusTriggerAfterClose?: boolean;
    readonly okButtonTestId?: string;
    readonly cancelButtonTestId?: string;
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
    okDisabled = false,
    centered = false,
    showCancel = true,
    closable = true,
    maskClosable = true,
    keyboard = true,
    focusTriggerAfterClose = true,
    okButtonTestId,
    cancelButtonTestId,
}: ModalProps) => (
    <AntModal
        open={open}
        {...(title !== undefined ? { title } : {})}
        {...(onOk !== undefined ? { onOk } : {})}
        {...(onCancel !== undefined ? { onCancel } : {})}
        {...(okText !== undefined ? { okText } : {})}
        {...(cancelText !== undefined ? { cancelText } : {})}
        {...(!showCancel
            ? { cancelButtonProps: { style: { display: 'none' } } }
            : {
                  cancelButtonProps: {
                      ...(cancelButtonTestId !== undefined ? { id: cancelButtonTestId } : {}),
                      ...(cancelButtonTestId !== undefined
                          ? { 'data-testid': cancelButtonTestId }
                          : {}),
                  },
              })}
        okButtonProps={{
            ...(okDanger ? { danger: true } : {}),
            ...(okDisabled ? { disabled: true } : {}),
            ...(okButtonTestId !== undefined ? { id: okButtonTestId } : {}),
            ...(okButtonTestId !== undefined ? { 'data-testid': okButtonTestId } : {}),
            style: { boxShadow: 'none' },
        }}
        centered={centered}
        closable={closable}
        maskClosable={maskClosable}
        keyboard={keyboard}
        focusTriggerAfterClose={focusTriggerAfterClose}
    >
        {children}
    </AntModal>
);
