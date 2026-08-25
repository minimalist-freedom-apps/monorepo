import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { Mnemonic } from '@evolu/common';
import { createEnsureEvoluMnemonic } from './createEnsureEvoluMnemonic';

const secureMnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

describe(createEnsureEvoluMnemonic.name, () => {
    test('loads and persists the secure mnemonic', async () => {
        const persistMnemonic = mock.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => secureMnemonic,
            persistMnemonic,
        });

        assert.strictEqual(await ensureMnemonic(), secureMnemonic);
        assert.strictEqual(persistMnemonic.mock.callCount(), 1);
        assert.deepStrictEqual(persistMnemonic.mock.calls[0]?.arguments, [secureMnemonic]);
    });

    test('propagates secure persistence failures', async () => {
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            persistMnemonic: () => Promise.reject(new Error('secure storage unavailable')),
        });

        await assert.rejects(
            ensureMnemonic(),
            (error: unknown) =>
                error instanceof Error && error.message.includes('secure storage unavailable'),
        );
    });

    test('generates and persists one mnemonic for concurrent callers', async () => {
        const persistMnemonic = mock.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            persistMnemonic,
        });

        const [first, second] = await Promise.all([ensureMnemonic(), ensureMnemonic()]);

        assert.strictEqual(first, second);
        assert.strictEqual(Mnemonic.fromUnknown(first).ok, true);
        assert.strictEqual(persistMnemonic.mock.callCount(), 1);
    });
});
