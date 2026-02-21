import { exhaustive } from '@minimalist-apps/type-utils';
import { Button as AntButton, theme } from 'antd';
import type { ReactNode } from 'react';
import type { Intent } from './intent';

export type ButtonIntent = Intent;

interface ButtonProps {
    readonly children?: ReactNode;
    readonly onClick?: () => void;
    readonly loading?: boolean;
    readonly disabled?: boolean;
    readonly icon?: ReactNode;
    readonly intent?: ButtonIntent;
    readonly variant?: 'text' | 'default';
    readonly size?: 'small' | 'medium' | 'large';
    readonly style?: React.CSSProperties;
}

const buildIntentStyle = (
    intent: ButtonIntent | undefined,
    isTextVariant: boolean,
    token: ReturnType<typeof theme.useToken>['token'],
): React.CSSProperties => {
    if (intent === undefined) {
        return {};
    }

    switch (intent) {
        case 'warning':
            return isTextVariant
                ? { color: token.colorWarning }
                : {
                      color: token.colorTextLightSolid,
                      backgroundColor: token.colorWarning,
                      borderColor: token.colorWarning,
                  };
        case 'secondary':
            return isTextVariant
                ? { color: token.colorTextSecondary }
                : {
                      color: token.colorText,
                      backgroundColor: token.colorBgContainerDisabled,
                      borderColor: token.colorBgContainerDisabled,
                  };
        case 'primary':
            return isTextVariant ? {} : {};
        case 'danger':
            return isTextVariant ? {} : {};
        default: {
            return exhaustive(intent);
        }
    }
};

const buildStyles = (
    intent: ButtonIntent | undefined,
    isTextVariant: boolean,
    token: ReturnType<typeof theme.useToken>['token'],
    style: React.CSSProperties | undefined,
): React.CSSProperties => ({
    boxShadow: 'none',
    ...buildIntentStyle(intent, isTextVariant, token),
    ...style,
});

export const Button = ({
    children,
    onClick,
    loading = false,
    disabled = false,
    icon,
    intent,
    variant = 'default',
    size = 'medium',
    style,
}: ButtonProps) => {
    const { token } = theme.useToken();
    const isTextVariant = variant === 'text';
    const type = isTextVariant ? 'text' : 'primary';

    const isDanger = intent === 'danger';

    return (
        <AntButton
            type={type}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            icon={icon}
            danger={isDanger}
            size={size === 'medium' ? 'middle' : size}
            style={buildStyles(intent, isTextVariant, token, style)}
        >
            {children}
        </AntButton>
    );
};
