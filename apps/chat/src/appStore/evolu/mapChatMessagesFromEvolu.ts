import type { allChatMessagesQuery } from './allChatMessagesQuery';
import type { EncryptedChatMessage } from './chatMessage';

type ChatMessageRow = ReturnType<typeof allChatMessagesQuery>['Row'];

export const mapChatMessagesFromEvolu = (
    rows: ReadonlyArray<ChatMessageRow>,
): ReadonlyArray<EncryptedChatMessage> => {
    const messages: Array<EncryptedChatMessage> = [];

    for (const row of rows) {
        if (row.senderId === null || row.encryptedMessage === null) {
            continue;
        }

        messages.push({
            id: row.id,
            senderId: row.senderId,
            encryptedMessage: row.encryptedMessage,
            createdAt: row.createdAt,
        });
    }

    return messages;
};
