import type { EnsureEvoluStorageDep } from './schema';

export type SaveChatMessage = (props: {
    readonly senderId: string;
    readonly encryptedMessage: string;
}) => Promise<void>;

export type SaveChatMessageDep = {
    readonly saveChatMessage: SaveChatMessage;
};

export const createSaveChatMessage =
    (deps: EnsureEvoluStorageDep): SaveChatMessage =>
    async ({ senderId, encryptedMessage }) => {
        const storage = await deps.ensureEvoluStorage();
        const insertResult = storage.evolu.insert('chatMessage', {
            senderId,
            encryptedMessage,
        });

        if (insertResult.ok === false) {
            throw new Error('Failed to save chat message.');
        }
    };
