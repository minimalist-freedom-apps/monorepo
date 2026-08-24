import { type EvoluSchema, Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createRestoreMnemonic } from './createRestoreMnemonic';

const mnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

describe(createRestoreMnemonic.name, () => {
    test('persists the mnemonic inside the owner restoration transaction', async () => {
        const setEvoluMnemonic = vi.fn(() => Promise.resolve());
        const restoreOwner = vi.fn(async params => {
            expect(setEvoluMnemonic).not.toHaveBeenCalled();
            await params.persistMnemonic();
        });
        const restoreMnemonic = createRestoreMnemonic<EvoluSchema>({
            setEvoluMnemonic,
            ensureEvoluStorage: () => Promise.resolve({ restoreOwner } as never),
        });

        await restoreMnemonic(mnemonic);

        expect(restoreOwner).toHaveBeenCalledWith({
            mnemonic,
            persistMnemonic: expect.any(Function),
        });
        expect(setEvoluMnemonic).toHaveBeenCalledExactlyOnceWith(mnemonic);
    });
});
