import { Mnemonic } from '@evolu/common';
import type { SecureStorage } from '@minimalist-apps/secure-storage';
import { describe, expect, test, vi } from 'vitest';
import { createEvoluMnemonicStorage } from './createEvoluMnemonicStorage';

const mnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

describe(createEvoluMnemonicStorage.name, () => {
    test('loads and saves a valid mnemonic under the Evolu key', async () => {
        const secureStorage: SecureStorage = {
            load: vi.fn(async () => mnemonic),
            save: vi.fn(async () => undefined),
        };
        const storage = createEvoluMnemonicStorage({ secureStorage });

        await expect(storage.load()).resolves.toBe(mnemonic);
        await storage.save(mnemonic);

        expect(secureStorage.load).toHaveBeenCalledWith({ key: 'evoluMnemonic' });
        expect(secureStorage.save).toHaveBeenCalledWith({
            key: 'evoluMnemonic',
            value: mnemonic,
        });
    });

    test('returns null when no secure mnemonic exists', async () => {
        const storage = createEvoluMnemonicStorage({
            secureStorage: {
                load: async () => null,
                save: async () => undefined,
            },
        });

        await expect(storage.load()).resolves.toBeNull();
    });

    test('rejects invalid secure data instead of silently creating a new owner', async () => {
        const storage = createEvoluMnemonicStorage({
            secureStorage: {
                load: async () => 'not a mnemonic',
                save: async () => undefined,
            },
        });

        await expect(storage.load()).rejects.toThrow('Invalid Evolu mnemonic in secure storage');
    });
});
