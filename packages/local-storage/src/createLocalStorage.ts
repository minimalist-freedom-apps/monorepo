import { type Result, err, ok } from '@evolu/common';

export interface StorageError {
    readonly type: 'StorageError';
    readonly caused: unknown;
}

export interface LocalStorage {
    readonly save: <T>(key: string, value: T) => Result<void, StorageError>;
    readonly load: <T>(key: string) => Result<T | null, StorageError>;
}

export interface LocalStorageDep {
    readonly localStorage: LocalStorage;
}

export const createLocalStorage = (): LocalStorage => {
    const save = <T>(key: string, value: T): Result<void, StorageError> => {
        try {
            globalThis.localStorage.setItem(key, JSON.stringify(value));

            return ok();
        } catch (error) {
            return err({ type: 'StorageError', caused: error });
        }
    };

    const load = <T>(key: string): Result<T | null, StorageError> => {
        try {
            const item = globalThis.localStorage.getItem(key);

            return ok(item ? JSON.parse(item) : null);
        } catch (error) {
            return err({ type: 'StorageError', caused: error });
        }
    };

    return { save, load };
};
