import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { type EvoluSchema, Mnemonic } from '@evolu/common';
import { createRestoreMnemonic } from './createRestoreMnemonic';

const mnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

describe(createRestoreMnemonic.name, () => {
    test('persists the mnemonic inside the owner restoration transaction', async () => {
        const setEvoluMnemonic = mock.fn(() => Promise.resolve());
        const restoreOwner = mock.fn(async params => {
            assert.strictEqual(setEvoluMnemonic.mock.callCount(), 0);
            await params.persistMnemonic();
        });
        const restoreMnemonic = createRestoreMnemonic<EvoluSchema>({
            setEvoluMnemonic,
            ensureEvoluStorage: () => Promise.resolve({ restoreOwner } as never),
        });

        await restoreMnemonic(mnemonic);

        const restoreOwnerParams = restoreOwner.mock.calls.at(-1)?.arguments[0];
        assert.strictEqual(restoreOwnerParams?.mnemonic, mnemonic);
        assert.strictEqual(typeof restoreOwnerParams?.persistMnemonic, 'function');
        assert.strictEqual(setEvoluMnemonic.mock.callCount(), 1);
        assert.deepStrictEqual(setEvoluMnemonic.mock.calls[0]?.arguments, [mnemonic]);
    });
});
