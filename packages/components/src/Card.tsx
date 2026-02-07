import { Card as AntCard } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
    readonly children?: ReactNode;
    readonly title?: ReactNode;
    readonly padding?: CSSProperties['padding'];
}

export const Card = ({ children, title, padding = 16 }: CardProps) => (
    <AntCard title={title} styles={{ body: { padding }, header: { padding } }}>
        {children}
    </AntCard>
);
