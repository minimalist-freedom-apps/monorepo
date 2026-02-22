import { Group, Identity, Provider } from 'openmls-wasm';
import type { ChatMessage, EncryptedChatMessage } from '../../appStore/evolu/chatMessage';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const GROUP_ID = 'minimalist-chat-group-v1';
const SHARED_OPENMLS_MEMBER = 'minimalist-shared-openmls-member';
const DECRYPTION_FAILED_TEXT = '[Unable to decrypt message]';

const bytesToBase64 = (value: Uint8Array): string => {
    let binary = '';

    for (const byte of value) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
};

const base64ToBytes = (value: string): Uint8Array => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

const createSession = () => {
    const provider = new Provider();
    const identity = new Identity(provider, SHARED_OPENMLS_MEMBER);
    const group = Group.create_new(provider, identity, GROUP_ID);

    return { provider, identity, group };
};

export interface OpenMlsGroupChat {
    readonly encryptMessage: (
        text: string,
        messages: ReadonlyArray<EncryptedChatMessage>,
    ) => string;
    readonly decryptMessages: (
        messages: ReadonlyArray<EncryptedChatMessage>,
    ) => ReadonlyArray<ChatMessage>;
}

const sortByTranscriptOrder = (
    messages: ReadonlyArray<EncryptedChatMessage>,
): ReadonlyArray<EncryptedChatMessage> =>
    [...messages].sort((a, b) => {
        const createdAtCompare = a.createdAt.localeCompare(b.createdAt);

        if (createdAtCompare !== 0) {
            return createdAtCompare;
        }

        return a.id.localeCompare(b.id);
    });

const replayMessages = (
    session: ReturnType<typeof createSession>,
    messages: ReadonlyArray<EncryptedChatMessage>,
) => {
    const orderedMessages = sortByTranscriptOrder(messages);

    for (const message of orderedMessages) {
        try {
            session.group.process_message(
                session.provider,
                base64ToBytes(message.encryptedMessage),
            );
        } catch {}
    }
};

export const createOpenMlsGroupChat = (): OpenMlsGroupChat => ({
    encryptMessage: (text, messages) => {
        const senderSession = createSession();

        replayMessages(senderSession, messages);

        const messageBytes = senderSession.group.create_message(
            senderSession.provider,
            senderSession.identity,
            encoder.encode(text),
        );

        return bytesToBase64(messageBytes);
    },
    decryptMessages: messages => {
        const replaySession = createSession();
        const orderedMessages = sortByTranscriptOrder(messages);

        return orderedMessages.map(message => {
            try {
                const plaintext = replaySession.group.process_message(
                    replaySession.provider,
                    base64ToBytes(message.encryptedMessage),
                );

                return {
                    ...message,
                    text: decoder.decode(plaintext),
                };
            } catch {
                return {
                    ...message,
                    text: DECRYPTION_FAILED_TEXT,
                };
            }
        });
    },
});
