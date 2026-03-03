import { Mnemonic } from '@evolu/common';
import { describe, expect, test } from 'vitest';
import { createEvoluFactory } from './createEvoluFactory';
import { createEvoluStorageFactory } from './createEvoluStorage';
import { TodoTestSchema } from './mockEvoluStorage';
import { testCreateRunWithEvoluDeps } from './testCreateRunWithEvoluDeps';

describe(createEvoluStorageFactory.name, () => {
    test('restoreOwner recreates evolu instance and updates active owner', async () => {
        await using run = await testCreateRunWithEvoluDeps();

        const createEvolu = createEvoluFactory<typeof TodoTestSchema>({ run });

        const createEvoluStorage = createEvoluStorageFactory<typeof TodoTestSchema>({
            createEvolu,
        });

        const storage = await createEvoluStorage({
            mnemonic: Mnemonic.orThrow(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            ),
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        const firstEvolu = storage.evolu;
        const firstOwnerId = storage.activeOwner.id;

        await storage.restoreOwner(
            Mnemonic.orThrow(
                'legal winner thank year wave sausage worth useful legal winner thank yellow',
            ),
        );

        expect(storage.evolu).not.toBe(firstEvolu);
        expect(storage.activeOwner.id).not.toBe(firstOwnerId);

        await storage.dispose();
    });
});
