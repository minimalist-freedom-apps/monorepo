import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createEnsureEvoluMnemonic } from './createEnsureEvoluMnemonic';

const legacyMnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);
const secureMnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

describe(createEnsureEvoluMnemonic.name, () => {
    test('prefers the secure mnemonic and removes a stale legacy value after persisting', async () => {
        const calls: Array<string> = [];
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => secureMnemonic,
            getLegacyMnemonic: () => legacyMnemonic,
            persistMnemonic: mnemonic => {
                calls.push(`persist:${mnemonic}`);

                return Promise.resolve();
            },
            removeLegacyMnemonic: () => {
                calls.push('removeLegacy');

                return Promise.resolve();
            },
        });

        await expect(ensureMnemonic()).resolves.toBe(secureMnemonic);
        expect(calls).toEqual([`persist:${secureMnemonic}`, 'removeLegacy']);
    });

    test('migrates a legacy mnemonic before deleting its plaintext value', async () => {
        const calls: Array<string> = [];
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            getLegacyMnemonic: () => legacyMnemonic,
            persistMnemonic: mnemonic => {
                calls.push(`persist:${mnemonic}`);

                return Promise.resolve();
            },
            removeLegacyMnemonic: () => {
                calls.push('removeLegacy');

                return Promise.resolve();
            },
        });

        await expect(ensureMnemonic()).resolves.toBe(legacyMnemonic);
        expect(calls).toEqual([`persist:${legacyMnemonic}`, 'removeLegacy']);
    });

    test('does not delete the legacy mnemonic when secure persistence fails', async () => {
        const removeLegacyMnemonic = vi.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            getLegacyMnemonic: () => legacyMnemonic,
            persistMnemonic: () => Promise.reject(new Error('secure storage unavailable')),
            removeLegacyMnemonic,
        });

        await expect(ensureMnemonic()).rejects.toThrow('secure storage unavailable');
        expect(removeLegacyMnemonic).not.toHaveBeenCalled();
    });

    test('generates and persists one mnemonic for concurrent callers', async () => {
        const persistMnemonic = vi.fn(async () => undefined);
        const removeLegacyMnemonic = vi.fn(async () => undefined);
        const ensureMnemonic = createEnsureEvoluMnemonic({
            loadSecureMnemonic: async () => null,
            getLegacyMnemonic: () => null,
            persistMnemonic,
            removeLegacyMnemonic,
        });

        const [first, second] = await Promise.all([ensureMnemonic(), ensureMnemonic()]);

        expect(first).toBe(second);
        expect(Mnemonic.fromUnknown(first).ok).toBe(true);
        expect(persistMnemonic).toHaveBeenCalledTimes(1);
        expect(removeLegacyMnemonic).toHaveBeenCalledTimes(1);
    });
});
