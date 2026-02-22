export type EncryptedChatMessage = {
    readonly id: string;
    readonly senderId: string;
    readonly parentMessageId: string | null;
    readonly encryptedMessage: string;
    readonly createdAt: string;
};

export type ChatMessage = EncryptedChatMessage & {
    readonly text: string;
};
