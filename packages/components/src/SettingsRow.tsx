import { isNonEmptyString } from '@minimalist-apps/type-utils';
import type { ReactNode } from 'react';
import { Card, Column, Row, Text, Title } from './index';

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
                        <Title level={5}>{label}</Title>
                        {isNonEmptyString(description) ? <Text>{description}</Text> : null}
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
                    <Title level={5}>{label}</Title>
                    {isNonEmptyString(description) ? <Text>{description}</Text> : null}
                </Column>
                {children}
            </Row>
        </Card>
    );
};
