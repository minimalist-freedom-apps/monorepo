import { SecureStorage as CapacitorSecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import type { SecureStorage } from '@minimalist-apps/secure-storage';

interface NativeSecureStorage {
    readonly getItem: (key: string) => Promise<string | null>;
    readonly setItem: (key: string, value: string) => Promise<void>;
}

interface CreateCapacitorSecureStorageProps {
    readonly platform: string;
    readonly nativeStorage: NativeSecureStorage;
}

export const createCapacitorSecureStorage = ({
    platform,
    nativeStorage,
}: CreateCapacitorSecureStorageProps): SecureStorage => {
    if (platform !== 'android' && platform !== 'ios') {
        throw new Error('Capacitor secure storage requires a native platform');
    }

    return {
        load: ({ key }) => nativeStorage.getItem(key),
        save: ({ key, value }) => nativeStorage.setItem(key, value),
    };
};

export const createCapacitorSecureStorageCompositionRoot = (): SecureStorage =>
    createCapacitorSecureStorage({
        platform: Capacitor.getPlatform(),
        nativeStorage: CapacitorSecureStorage,
    });
