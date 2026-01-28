import { FloatButton as AntFloatButton } from 'antd';
import type { ReactNode } from 'react';
import { BRAND_COLORS } from './colors';

interface FloatButtonProps {
    readonly onClick: () => void;
    readonly icon: ReactNode;
    readonly tooltip?: string;
}

export const FloatButton = ({ onClick, icon, tooltip }: FloatButtonProps) => (
    <AntFloatButton
        icon={icon}
        type="primary"
        onClick={onClick}
        style={{
            backgroundColor: BRAND_COLORS.primary,
            width: 56,
            height: 56,
        }}
        tooltip={tooltip}
    />
);
