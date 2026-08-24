import { exhaustive } from '@minimalist-apps/type-utils';
import { Alert } from 'antd';
import type { ReactNode } from 'react';
import type { Intent } from './intent';

interface BannerProps {
    readonly children: ReactNode;
    readonly intent?: Intent;
    readonly showIcon?: boolean;
    readonly style?: React.CSSProperties;
    readonly testId?: string;
}

const buildBannerType = (intent: Intent | undefined): 'info' | 'warning' | 'error' => {
    switch (intent) {
        case 'primary':
        case 'secondary':
        case undefined:
            return 'info';

        case 'warning':
            return 'warning';
        case 'danger':
            return 'error';

        default: {
            return exhaustive(intent);
        }
    }
};

export const Banner = ({ children, intent, showIcon = true, style, testId }: BannerProps) => (
    <Alert
        {...(children !== undefined ? { description: children } : {})}
        type={buildBannerType(intent)}
        showIcon={showIcon}
        {...(style !== undefined ? { style } : {})}
        {...(testId !== undefined ? { id: testId, 'data-testid': testId } : {})}
    />
);
