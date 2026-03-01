import { Card, Column, Text, Title } from '@minimalist-apps/components';
import type { DebugHeaderDep } from '@minimalist-apps/fragment-debug';

export const HomeScreenPure = (deps: DebugHeaderDep) => (
    <Column gap={8}>
        <deps.DebugHeader />
        <Card>
            <Column gap={8}>
                <div id="home-screen-title">
                    <Title level={4}>🔄 Android Sync</Title>
                </div>
                <Text>Empty app scaffold is ready.</Text>
            </Column>
        </Card>
    </Column>
);
