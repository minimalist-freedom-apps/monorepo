import type { ReactNode } from 'react';
import { Column } from './Flex';

interface FractionProps {
    readonly numerator: ReactNode;
    readonly denominator: ReactNode;
}

export const Fraction = ({ numerator, denominator }: FractionProps) => (
    <Column align="center" gap={4} justify="center" style={{ width: '100%' }}>
        {numerator}

        <div
            style={{
                width: '100%',
                height: 2,
                backgroundColor: 'currentColor',
                opacity: 0.4,
                borderRadius: 1,
            }}
        />

        {denominator}
    </Column>
);
