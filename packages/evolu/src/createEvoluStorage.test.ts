import { describe, expect, test } from 'bun:test';
import type { Mnemonic, Run } from '@evolu/common';
import type { EvoluPlatformDeps } from '@evolu/common/local-first';
import { createEvoluStorage } from './createEvoluStorage';
import { TodoTestSchema } from './mockEvoluStorage';

describe(createEvoluStorage.name, () => {
    test('restoreOwner recreates evolu instance and updates active owner', async () => {
        const disposedEvoluInstances: Array<unknown> = [];

        const run = ((_task: unknown) =>
            Promise.resolve({
                ok: true as const,
                value: {
                    [Symbol.asyncDispose]: async () => {
                        disposedEvoluInstances.push(Symbol.for('disposed'));

                        await Promise.resolve();
                    },
                },
            })) as unknown as Run<EvoluPlatformDeps>;

        const storage = await createEvoluStorage(
            {
                run,
            },
            {
                mnemonic:
                    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' as Mnemonic,
                schema: TodoTestSchema,
                appName: 'minimalist-apps-test',
            },
        );

        const firstEvolu = storage.evolu;
        const firstOwnerId = storage.activeOwner.id;

        await storage.restoreOwner(
            'legal winner thank year wave sausage worth useful legal winner thank yellow' as Mnemonic,
        );

        expect(storage.evolu).not.toBe(firstEvolu);
        expect(storage.activeOwner.id).not.toBe(firstOwnerId);
        expect(disposedEvoluInstances.length).toBe(1);

        await storage.dispose();
        expect(disposedEvoluInstances.length).toBe(2);
    });
});
