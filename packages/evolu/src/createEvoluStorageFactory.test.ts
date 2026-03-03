import { Mnemonic } from '@evolu/common';
import { describe, expect, test } from 'vitest';
import { createEvoluFactory } from './createEvoluFactory';
import { createEvoluStorageFactory } from './createEvoluStorageFactory';
import { TodoTestSchema } from './mockEvoluStorage';
import { testCreateRunWithEvoluDeps } from './testCreateRunWithEvoluDeps';

describe(createEvoluStorageFactory.name, () => {
    // Todo: once "Dependency 'port' already added" issue is resolved in Evolu
    test.skip('restoreOwner recreates evolu instance and updates active owner', async () => {
        await using run = await testCreateRunWithEvoluDeps();
        const createEvolu = createEvoluFactory<TodoTestSchema>({ run });

        const createEvoluStorage = createEvoluStorageFactory<TodoTestSchema>({
            createEvolu,
        });

        const storage = await createEvoluStorage({
            mnemonic: Mnemonic.orThrow(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            ),
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
            urls: [],
        });

        const firstEvolu = storage.evolu;
        expect(storage.activeOwner.id).toBe('F0xh0HpiAx5shgCgtGENww');

        await storage.restoreOwner(
            Mnemonic.orThrow(
                'legal winner thank year wave sausage worth useful legal winner thank yellow',
            ),
        );

        expect(storage.evolu).not.toBe(firstEvolu);
        expect(storage.activeOwner.id).toBe('9ac66DowyF8lV0ioma5_2Q');

        await storage.dispose();
    });
});
