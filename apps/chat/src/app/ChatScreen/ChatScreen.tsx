import { Button, Card, Column, Input, List, Row, Text, Title } from '@minimalist-apps/components';
import type { DebugHeaderDep } from '@minimalist-apps/fragment-debug';
import type { FC } from 'react';
import { useState } from 'react';
import type { ChatMessage } from '../../appStore/evolu/chatMessage';

type ChatScreenStateProps = {
    readonly identity: string;
    readonly messages: ReadonlyArray<ChatMessage>;
};

type ChatScreenDeps = DebugHeaderDep & {
    readonly sendChatMessage: (props: {
        readonly senderId: string;
        readonly text: string;
    }) => Promise<void>;
};

export type ChatScreenDep = {
    readonly ChatScreen: FC<{ readonly identity: string }>;
};

export const ChatScreenPure = (
    deps: ChatScreenDeps,
    { identity, messages }: ChatScreenStateProps,
) => {
    const [draft, setDraft] = useState('');

    const send = async () => {
        const text = draft.trim();

        if (text.length === 0 || identity.length === 0) {
            return;
        }

        await deps.sendChatMessage({ senderId: identity, text });
        setDraft('');
    };

    return (
        <Card>
            <Column gap={12}>
                <deps.DebugHeader />
                <Title level={4}>💬 Group Chat</Title>
                <Text>Your random identity: {identity || 'starting...'}</Text>
                <List
                    items={messages.map(message => ({ ...message, key: message.id }))}
                    emptyText="No messages yet"
                    renderItem={message => (
                        <Column gap={2}>
                            <Text strong>{message.senderId}</Text>
                            <Text>{message.text}</Text>
                            <Text>{new Date(message.createdAt).toLocaleString()}</Text>
                        </Column>
                    )}
                />
                <Row gap={8}>
                    <Input
                        value={draft}
                        onChange={value => setDraft(value)}
                        placeholder="Write a message..."
                    />
                    <Button onClick={send}>Send</Button>
                </Row>
            </Column>
        </Card>
    );
};
