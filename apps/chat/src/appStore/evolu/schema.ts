import { id, NonEmptyString100, NonEmptyString1000 } from '@evolu/common';
import type {
    EnsureEvoluStorageDep as EnsureEvoluStorageDepPackage,
    EvoluStorage as EvoluStoragePackage,
} from '@minimalist-apps/evolu';

const ChatMessageId = id('ChatMessageId');
// biome-ignore lint/correctness/noUnusedVariables: Type alias for Evolu schema
type ChatMessageId = typeof ChatMessageId.Type;

const chatMessage = {
    id: ChatMessageId,
    senderId: NonEmptyString100,
    encryptedMessage: NonEmptyString1000,
};

export const Schema = {
    chatMessage,
};

export type EvoluStorage = EvoluStoragePackage<typeof Schema>;

export type EnsureEvoluStorageDep = EnsureEvoluStorageDepPackage<typeof Schema>;
