import { FloatButton as AntFloatButton } from 'antd';
import type { ReactNode } from 'react';

interface FloatButtonProps {
    readonly onClick: () => void;
    readonly icon: ReactNode;
    readonly tooltip?: string;
    readonly testId?: string;
}

export const FloatButton = ({ onClick, icon, tooltip, testId }: FloatButtonProps) => (
    <AntFloatButton
        icon={icon}
        type="primary"
        onClick={onClick}
        data-testid={testId}
        style={{
            width: 56,
            height: 56,
        }}
        tooltip={tooltip}
    />
);
