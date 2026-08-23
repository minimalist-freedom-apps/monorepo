export interface SecureStorageLoadProps {
    readonly key: string;
}

export interface SecureStorageSaveProps {
    readonly key: string;
    readonly value: string;
}

export interface SecureStorage {
    readonly load: (props: SecureStorageLoadProps) => Promise<string | null>;
    readonly save: (props: SecureStorageSaveProps) => Promise<void>;
}

export interface SecureStorageDep {
    readonly secureStorage: SecureStorage;
}
