import { describe, expect, test, vi } from 'vitest';
import { createSecureStorage } from './createSecureStorage';

describe(createSecureStorage.name, () => {
    test('delegates persistence to native secure storage on Android', async () => {
        const nativeStorage = {
            getItem: vi.fn(async () => 'secret'),
            setItem: vi.fn(async () => undefined),
        };
        const storage = createSecureStorage({ platform: 'android', nativeStorage });

        await expect(storage.load({ key: 'mnemonic' })).resolves.toBe('secret');
        await storage.save({ key: 'mnemonic', value: 'new-secret' });

        expect(nativeStorage.getItem).toHaveBeenCalledWith('mnemonic');
        expect(nativeStorage.setItem).toHaveBeenCalledWith('mnemonic', 'new-secret');
    });

    test('keeps browser values in memory without invoking the plaintext web plugin', async () => {
        const nativeStorage = {
            getItem: vi.fn(async () => null),
            setItem: vi.fn(async () => undefined),
        };
        const storage = createSecureStorage({ platform: 'web', nativeStorage });

        await storage.save({ key: 'mnemonic', value: 'secret' });
        await expect(storage.load({ key: 'mnemonic' })).resolves.toBe('secret');

        expect(nativeStorage.getItem).not.toHaveBeenCalled();
        expect(nativeStorage.setItem).not.toHaveBeenCalled();
    });
});
