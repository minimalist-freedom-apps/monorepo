import { Card, Column, Text, Title } from '@minimalist-apps/components';
import type { DebugHeaderDep } from '@minimalist-apps/fragment-debug';

export const HomeScreenPure = (deps: DebugHeaderDep) => (
    <Card>
        <Column gap={8}>
            <deps.DebugHeader />
            <Title level={4}>🔄 Android Sync</Title>
            <Text>Empty app scaffold is ready.</Text>
        </Column>
    </Card>
);
