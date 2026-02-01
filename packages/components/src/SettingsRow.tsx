import type { ReactNode } from 'react';
import { Card, Column, Row, Text } from './index';

interface SettingsRowProps {
    readonly label: ReactNode;
    readonly children: ReactNode;
    readonly description?: ReactNode;
    readonly direction?: 'row' | 'column';
}

export const SettingsRow = ({
    label,
    children,
    description,
    direction = 'row',
}: SettingsRowProps) => {
    if (direction === 'column') {
        return (
            <Card>
                <Column gap={12}>
                    <Column gap={4}>
                        <Text>{label}</Text>
                        {description && <Text>{description}</Text>}
                    </Column>
                    {children}
                </Column>
            </Card>
        );
    }

    return (
        <Card>
            <Row align="center" justify="space-between">
                <Column gap={4}>
                    <Text>{label}</Text>
                    {description && <Text>{description}</Text>}
                </Column>
                {children}
            </Row>
        </Card>
    );
};
