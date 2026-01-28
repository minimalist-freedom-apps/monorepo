import { Button as AntButton } from 'antd';
import type { ReactNode } from 'react';

interface ButtonProps {
    readonly children?: ReactNode;
    readonly onClick?: () => void;
    readonly loading?: boolean;
    readonly disabled?: boolean;
    readonly icon?: ReactNode;
    readonly danger?: boolean;
    readonly variant?: 'primary' | 'text' | 'default';
    readonly size?: 'small' | 'middle' | 'large';
    readonly style?: React.CSSProperties;
}

export const Button = ({
    children,
    onClick,
    loading = false,
    disabled = false,
    icon,
    danger = false,
    variant = 'default',
    size = 'middle',
    style,
}: ButtonProps) => {
    const type =
        variant === 'primary'
            ? 'primary'
            : variant === 'text'
              ? 'text'
              : 'default';

    return (
        <AntButton
            type={type}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            icon={icon}
            danger={danger}
            size={size}
            style={style}
        >
            {children}
        </AntButton>
    );
};
