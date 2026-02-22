import { err, ok, type Result } from '@evolu/common';
import type { EnsureEvoluStorageDep } from './schema';

export type SaveChatMessageErrorType = { type: 'SaveChatMessageError'; caused: unknown };
export const SaveChatMessageError = ({
    caused,
}: {
    caused: unknown;
}): SaveChatMessageErrorType => ({
    type: 'SaveChatMessageError',
    caused,
});

export type SaveChatMessage = (props: {
    readonly senderId: string;
    readonly parentMessageId: string | null;
    readonly encryptedMessage: string;
}) => Promise<Result<void, SaveChatMessageErrorType>>;

export type SaveChatMessageDep = {
    readonly saveChatMessage: SaveChatMessage;
};

export const createSaveChatMessage =
    (deps: EnsureEvoluStorageDep): SaveChatMessage =>
    async ({ senderId, parentMessageId, encryptedMessage }) => {
        const storage = await deps.ensureEvoluStorage();

        const result = storage.evolu.insert('chatMessage', {
            senderId,
            parentMessageId,
            encryptedMessage,
        });

        if (!result.ok) {
            return err(SaveChatMessageError({ caused: result.error }));
        }

        return ok();
    };
