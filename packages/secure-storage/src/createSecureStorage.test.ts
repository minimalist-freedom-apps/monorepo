import { describe, expect, test, vi } from 'vitest';
import { createSecureStorage } from './createSecureStorage';

describe(createSecureStorage.name, () => {
    test('delegates persistence to native secure storage on Android', async () => {
        const nativeStorage = {
            getItem: vi.fn(async () => 'secret'),
            setItem: vi.fn(async () => undefined),
            removeItem: vi.fn(async () => undefined),
        };
        const storage = createSecureStorage({ platform: 'android', nativeStorage });

        expect(storage.isPersistent).toBe(true);
        await expect(storage.load({ key: 'mnemonic' })).resolves.toBe('secret');
        await storage.save({ key: 'mnemonic', value: 'new-secret' });
        await storage.remove({ key: 'mnemonic' });

        expect(nativeStorage.getItem).toHaveBeenCalledWith('mnemonic');
        expect(nativeStorage.setItem).toHaveBeenCalledWith('mnemonic', 'new-secret');
        expect(nativeStorage.removeItem).toHaveBeenCalledWith('mnemonic');
    });

    test('keeps browser values in memory without invoking the plaintext web plugin', async () => {
        const nativeStorage = {
            getItem: vi.fn(async () => null),
            setItem: vi.fn(async () => undefined),
            removeItem: vi.fn(async () => undefined),
        };
        const storage = createSecureStorage({ platform: 'web', nativeStorage });

        expect(storage.isPersistent).toBe(false);
        await storage.save({ key: 'mnemonic', value: 'secret' });
        await expect(storage.load({ key: 'mnemonic' })).resolves.toBe('secret');
        await storage.remove({ key: 'mnemonic' });
        await expect(storage.load({ key: 'mnemonic' })).resolves.toBeNull();

        expect(nativeStorage.getItem).not.toHaveBeenCalled();
        expect(nativeStorage.setItem).not.toHaveBeenCalled();
        expect(nativeStorage.removeItem).not.toHaveBeenCalled();
    });
});
