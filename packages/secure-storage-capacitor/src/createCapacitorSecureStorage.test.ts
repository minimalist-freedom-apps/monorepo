import { describe, expect, test, vi } from 'vitest';
import { createCapacitorSecureStorage } from './createCapacitorSecureStorage';

describe(createCapacitorSecureStorage.name, () => {
    test.each(['android', 'ios'] as const)('delegates persistence on %s', async platform => {
        const nativeStorage = {
            getItem: vi.fn(async () => 'secret'),
            setItem: vi.fn(async () => undefined),
        };
        const storage = createCapacitorSecureStorage({ platform, nativeStorage });

        await expect(storage.load({ key: 'mnemonic' })).resolves.toBe('secret');
        await storage.save({ key: 'mnemonic', value: 'new-secret' });

        expect(nativeStorage.getItem).toHaveBeenCalledWith('mnemonic');
        expect(nativeStorage.setItem).toHaveBeenCalledWith('mnemonic', 'new-secret');
    });

    test('refuses the Capacitor plugin plaintext web fallback', () => {
        const nativeStorage = {
            getItem: vi.fn(async () => null),
            setItem: vi.fn(async () => undefined),
        };

        expect(() =>
            createCapacitorSecureStorage({
                platform: 'web',
                nativeStorage,
            }),
        ).toThrow('Capacitor secure storage requires a native platform');

        expect(nativeStorage.getItem).not.toHaveBeenCalled();
        expect(nativeStorage.setItem).not.toHaveBeenCalled();
    });
});
