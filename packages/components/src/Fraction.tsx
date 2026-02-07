import type { ReactNode } from 'react';
import { Divider } from './Divider';
import { Column } from './Flex';

interface FractionProps {
    readonly numerator: ReactNode;
    readonly denominator: ReactNode;
}

export const Fraction = ({ numerator, denominator }: FractionProps) => (
    <Column align="center" gap={4} justify="center" style={{ width: '100%' }}>
        <div style={{ padding: '4px 8px' }}>{numerator}</div>

        <Divider />

        <div style={{ padding: '4px 8px' }}>{denominator}</div>
    </Column>
);
