import { Card as AntCard } from 'antd';
import type { ReactNode } from 'react';
import { buildSpacingStyle, type Spacing } from './spacing';

interface CardProps {
    readonly children?: ReactNode;
    readonly title?: ReactNode;
    readonly padding?: Spacing;
}

export const Card = ({ children, title, padding = 16 }: CardProps) => {
    const spacingPaddingStyle = buildSpacingStyle({ padding });

    return (
        <AntCard title={title} styles={{ body: spacingPaddingStyle, header: spacingPaddingStyle }}>
            {children}
        </AntCard>
    );
};
