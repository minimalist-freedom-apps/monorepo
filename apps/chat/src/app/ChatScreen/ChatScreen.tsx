import { Card, Column, Text, Title } from '@minimalist-apps/components';
import type { DebugHeaderDep } from '@minimalist-apps/fragment-debug';

export const ChatScreenPure = (deps: DebugHeaderDep) => (
    <Card>
        <Column gap={8}>
            <deps.DebugHeader />
            <Title level={4}>💬 Chat</Title>
            <Text>Chat screen setup is ready.</Text>
        </Column>
    </Card>
);
