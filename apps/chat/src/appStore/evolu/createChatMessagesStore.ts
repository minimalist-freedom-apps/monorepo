import type { Subscribable } from '@minimalist-apps/connect';
import { createSubscribableQuery } from '@minimalist-apps/evolu';
import { allChatMessagesQuery } from './allChatMessagesQuery';
import type { EncryptedChatMessage } from './chatMessage';
import { mapChatMessagesFromEvolu } from './mapChatMessagesFromEvolu';
import type { EnsureEvoluStorageDep } from './schema';

export type ChatMessagesStore = Subscribable<ReadonlyArray<EncryptedChatMessage>>;

export interface ChatMessagesStoreDep {
    readonly chatMessagesStore: ChatMessagesStore;
}

export const createChatMessagesStore = (deps: EnsureEvoluStorageDep): ChatMessagesStore =>
    createSubscribableQuery(deps, allChatMessagesQuery, mapChatMessagesFromEvolu);
