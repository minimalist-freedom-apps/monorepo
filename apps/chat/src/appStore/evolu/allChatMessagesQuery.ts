import { sqliteTrue } from '@evolu/common';
import type { EvoluStorage } from './schema';

export const allChatMessagesQuery = (storage: EvoluStorage) =>
    storage.evolu.createQuery(db =>
        db
            .selectFrom('chatMessage')
            .select(['id', 'senderId', 'parentMessageId', 'encryptedMessage', 'createdAt'])
            .where('isDeleted', 'is not', sqliteTrue)
            .where('ownerId', '=', storage.activeOwner.id)
            .orderBy('createdAt', 'asc')
            .orderBy('id', 'asc'),
    );
