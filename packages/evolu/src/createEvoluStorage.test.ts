import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createEvoluStorageFactory } from './createEvoluStorage';
import { TodoTestSchema } from './mockEvoluStorage';

type MockEvolu = {
    readonly [Symbol.asyncDispose]: () => Promise<void>;
};

const createMockEvolu = () => {
    const asyncDispose = vi.fn(async () => {});
    const evolu: MockEvolu = {
        [Symbol.asyncDispose]: asyncDispose,
    };

    return { evolu, asyncDispose };
};

describe(createEvoluStorageFactory.name, () => {
    test('restoreOwner recreates evolu instance and updates active owner', async () => {
        const firstOwner = { id: 'owner-1' };
        const secondOwner = { id: 'owner-2' };

        const first = createMockEvolu();
        const second = createMockEvolu();

        const createEvolu = vi
            .fn()
            .mockResolvedValueOnce({ evolu: first.evolu, owner: firstOwner })
            .mockResolvedValueOnce({ evolu: second.evolu, owner: secondOwner });

        const createEvoluStorage = createEvoluStorageFactory<typeof TodoTestSchema>({
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            createEvolu: createEvolu as any,
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
        expect(first.asyncDispose).toHaveBeenCalledOnce();

        await storage.dispose();

        expect(second.asyncDispose).toHaveBeenCalledOnce();
    });
});
