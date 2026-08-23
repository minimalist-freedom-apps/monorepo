import { SecureStorage as CapacitorSecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

export interface SecureStorage {
    readonly load: (props: { readonly key: string }) => Promise<string | null>;
    readonly save: (props: { readonly key: string; readonly value: string }) => Promise<void>;
}

export interface SecureStorageDep {
    readonly secureStorage: SecureStorage;
}

export interface NativeSecureStorage {
    readonly getItem: (key: string) => Promise<string | null>;
    readonly setItem: (key: string, value: string) => Promise<void>;
}

type SecureStoragePlatform = 'android' | 'ios' | 'web';

interface CreateSecureStorageProps {
    readonly platform: SecureStoragePlatform;
    readonly nativeStorage: NativeSecureStorage;
}

export const createSecureStorage = ({
    platform,
    nativeStorage,
}: CreateSecureStorageProps): SecureStorage => {
    const memoryStorage = new Map<string, string>();
    const isNative = platform === 'android' || platform === 'ios';

    const load: SecureStorage['load'] = ({ key }) => {
        if (isNative) {
            return nativeStorage.getItem(key);
        }

        return Promise.resolve(memoryStorage.get(key) ?? null);
    };

    const save: SecureStorage['save'] = async ({ key, value }) => {
        if (isNative) {
            await nativeStorage.setItem(key, value);

            return;
        }

        memoryStorage.set(key, value);
    };

    return { load, save };
};

export const createSecureStorageCompositionRoot = (): SecureStorage => {
    const platform = Capacitor.getPlatform();

    return createSecureStorage({
        platform: platform === 'android' || platform === 'ios' ? platform : 'web',
        nativeStorage: CapacitorSecureStorage,
    });
};
