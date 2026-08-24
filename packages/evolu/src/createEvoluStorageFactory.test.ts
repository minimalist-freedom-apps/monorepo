// @vitest-environment node

import type { Evolu, Owner } from '@evolu/common';
import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { type CreateEvolu, createEvoluFactory } from './createEvoluFactory';
import { createEvoluStorageFactory } from './createEvoluStorageFactory';
import { TodoTestSchema } from './mockEvoluStorage';
import { testCreateRunWithEvoluDeps } from './testCreateRunWithEvoluDeps';

describe(createEvoluStorageFactory.name, () => {
    test('restoreOwner recreates evolu instance and updates active owner', async () => {
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

        await storage.restoreOwner({
            mnemonic: Mnemonic.orThrow(
                'legal winner thank year wave sausage worth useful legal winner thank yellow',
            ),
            persistMnemonic: () => Promise.resolve(),
        });

        expect(storage.evolu).not.toBe(firstEvolu);
        expect(storage.activeOwner.id).toBe('9ac66DowyF8lV0ioma5_2Q');

        await storage.dispose();
    });

    test('rolls back the active owner when mnemonic persistence fails', async () => {
        const events: Array<string> = [];
        const createFakeEvolu = (ownerId: string) => {
            const evolu = {
                [Symbol.asyncDispose]: vi.fn(() => {
                    events.push(`dispose:${ownerId}`);

                    return Promise.resolve();
                }),
            } as unknown as Evolu<TodoTestSchema>;

            return {
                evolu,
                owner: { id: ownerId } as Owner,
                updateRelayUrls: vi.fn(),
            };
        };
        const first = createFakeEvolu('first-owner');
        const candidate = createFakeEvolu('candidate-owner');
        const createEvolu = vi
            .fn()
            .mockResolvedValueOnce(first)
            .mockResolvedValueOnce(candidate) as unknown as CreateEvolu<TodoTestSchema>;
        const storage = await createEvoluStorageFactory<TodoTestSchema>({ createEvolu })({
            mnemonic: Mnemonic.orThrow(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            ),
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
            urls: [],
            onOwnerUsed: owner => events.push(`owner:${owner.id}`),
        });
        storage.subscribeOwnerChange(() => events.push('owner-change'));
        const persistenceError = new Error('secure storage failed');

        await expect(
            storage.restoreOwner({
                mnemonic: Mnemonic.orThrow(
                    'legal winner thank year wave sausage worth useful legal winner thank yellow',
                ),
                persistMnemonic: () => {
                    events.push(`persist:${storage.activeOwner.id}`);

                    return Promise.reject(persistenceError);
                },
            }),
        ).rejects.toBe(persistenceError);

        expect(storage.evolu).toBe(first.evolu);
        expect(storage.activeOwner).toBe(first.owner);
        expect(first.evolu[Symbol.asyncDispose]).not.toHaveBeenCalled();
        expect(candidate.evolu[Symbol.asyncDispose]).toHaveBeenCalledOnce();
        expect(events).toEqual([
            'owner:first-owner',
            'owner:candidate-owner',
            'owner-change',
            'persist:candidate-owner',
            'owner:first-owner',
            'owner-change',
            'dispose:candidate-owner',
        ]);

        await storage.dispose();
    });
});
