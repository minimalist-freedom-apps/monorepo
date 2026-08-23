import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createEnsureEvoluMnemonic } from './createEnsureEvoluMnemonic';

const secureMnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

describe(createEnsureEvoluMnemonic.name, () => {
    test('loads and persists the secure mnemonic', async () => {
        const persistMnemonic = vi.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => secureMnemonic,
            persistMnemonic,
        });

        await expect(ensureMnemonic()).resolves.toBe(secureMnemonic);
        expect(persistMnemonic).toHaveBeenCalledExactlyOnceWith(secureMnemonic);
    });

    test('propagates secure persistence failures', async () => {
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            persistMnemonic: () => Promise.reject(new Error('secure storage unavailable')),
        });

        await expect(ensureMnemonic()).rejects.toThrow('secure storage unavailable');
    });

    test('generates and persists one mnemonic for concurrent callers', async () => {
        const persistMnemonic = vi.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            persistMnemonic,
        });

        const [first, second] = await Promise.all([ensureMnemonic(), ensureMnemonic()]);

        expect(first).toBe(second);
        expect(Mnemonic.fromUnknown(first).ok).toBe(true);
        expect(persistMnemonic).toHaveBeenCalledTimes(1);
    });
});
