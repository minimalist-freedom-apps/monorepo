import { id, NonEmptyString100, NonEmptyString1000, nullOr } from '@evolu/common';
import type {
    EnsureEvoluStorageDep as EnsureEvoluStorageDepPackage,
    EvoluStorage as EvoluStoragePackage,
} from '@minimalist-apps/evolu';

export const ChatMessageId = id('ChatMessageId');
export type ChatMessageId = typeof ChatMessageId.Type;

const chatMessage = {
    id: ChatMessageId,
    senderId: NonEmptyString100,
    parentMessageId: nullOr(ChatMessageId),
    encryptedMessage: NonEmptyString1000,
};

export const Schema = {
    chatMessage,
};

export type EvoluStorage = EvoluStoragePackage<typeof Schema>;

export type EnsureEvoluStorageDep = EnsureEvoluStorageDepPackage<typeof Schema>;
