import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { Mnemonic } from '@evolu/common';
import type { SecureStorage } from '@minimalist-apps/secure-storage';
import { createEvoluMnemonicStorage } from './createEvoluMnemonicStorage';

const mnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

describe(createEvoluMnemonicStorage.name, () => {
    test('loads and saves a valid mnemonic under the Evolu key', async () => {
        const load = mock.fn<SecureStorage['load']>(async () => mnemonic);
        const save = mock.fn<SecureStorage['save']>(async () => undefined);
        const secureStorage: SecureStorage = {
            load,
            save,
        };
        const storage = createEvoluMnemonicStorage({ secureStorage });

        assert.strictEqual(await storage.load(), mnemonic);
        await storage.save(mnemonic);

        assert.deepStrictEqual(load.mock.calls.at(-1)?.arguments, [{ key: 'evoluMnemonic' }]);
        assert.deepStrictEqual(save.mock.calls.at(-1)?.arguments, [
            {
                key: 'evoluMnemonic',
                value: mnemonic,
            },
        ]);
    });

    test('returns null when no secure mnemonic exists', async () => {
        const storage = createEvoluMnemonicStorage({
            secureStorage: {
                load: async () => null,
                save: async () => undefined,
            },
        });

        assert.strictEqual(await storage.load(), null);
    });

    test('rejects invalid secure data instead of silently creating a new owner', async () => {
        const storage = createEvoluMnemonicStorage({
            secureStorage: {
                load: async () => 'not a mnemonic',
                save: async () => undefined,
            },
        });

        await assert.rejects(
            storage.load(),
            (error: unknown) =>
                error instanceof Error &&
                error.message.includes('Invalid Evolu mnemonic in secure storage'),
        );
    });
});
