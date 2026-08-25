import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import type { Evolu, Owner } from '@evolu/common';
import { Mnemonic } from '@evolu/common';
import { type CreateEvolu, createEvoluFactory } from './createEvoluFactory';
import { createEvoluStorageFactory } from './createEvoluStorageFactory';
import { TodoTestSchema } from './mockEvoluStorage';
import { testCreateRunWithEvoluDeps } from './testCreateRunWithEvoluDeps';

const restoredMnemonic = Mnemonic.orThrow(
    'legal winner thank year wave sausage worth useful legal winner thank yellow',
);

const createPendingPromise = <T>() => {
    let resolve: ((value: T) => void) | undefined;
    const promise = new Promise<T>(promiseResolve => {
        resolve = promiseResolve;
    });

    return {
        promise,
        resolve: (value: T) => resolve?.(value),
    };
};

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
        assert.strictEqual(storage.activeOwner.id, 'F0xh0HpiAx5shgCgtGENww');

        await storage.restoreOwner({
            mnemonic: Mnemonic.orThrow(
                'legal winner thank year wave sausage worth useful legal winner thank yellow',
            ),
            persistMnemonic: () => Promise.resolve(),
        });

        assert.notStrictEqual(storage.evolu, firstEvolu);
        assert.strictEqual(storage.activeOwner.id, '9ac66DowyF8lV0ioma5_2Q');

        await storage.dispose();
    });

    test('rolls back the active owner when mnemonic persistence fails', async () => {
        const events: Array<string> = [];
        const createFakeEvolu = (ownerId: string) => {
            const dispose = mock.fn(() => {
                events.push(`dispose:${ownerId}`);

                return Promise.resolve();
            });
            const evolu = {
                [Symbol.asyncDispose]: dispose,
            } as unknown as Evolu<TodoTestSchema>;

            return {
                dispose,
                evolu,
                owner: { id: ownerId } as Owner,
                updateRelayUrls: mock.fn(),
            };
        };
        const first = createFakeEvolu('first-owner');
        const candidate = createFakeEvolu('candidate-owner');
        const createEvoluMock = mock.fn(async () => candidate);
        createEvoluMock.mock.mockImplementationOnce(async () => first);
        const createEvolu = createEvoluMock as unknown as CreateEvolu<TodoTestSchema>;
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

        await assert.rejects(
            storage.restoreOwner({
                mnemonic: Mnemonic.orThrow(
                    'legal winner thank year wave sausage worth useful legal winner thank yellow',
                ),
                persistMnemonic: () => {
                    events.push(`persist:${storage.activeOwner.id}`);

                    return Promise.reject(persistenceError);
                },
            }),
            (error: unknown) => {
                assert.strictEqual(error, persistenceError);

                return true;
            },
        );

        assert.strictEqual(storage.status, 'ready');
        assert.strictEqual(storage.evolu, first.evolu);
        assert.strictEqual(storage.activeOwner, first.owner);
        assert.strictEqual(first.dispose.mock.callCount(), 0);
        assert.strictEqual(candidate.dispose.mock.callCount(), 1);
        assert.deepStrictEqual(events, [
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

    test('rejects concurrent owner restoration', async () => {
        const first = {
            evolu: {
                [Symbol.asyncDispose]: mock.fn(() => Promise.resolve()),
            } as unknown as Evolu<TodoTestSchema>,
            owner: { id: 'first-owner' } as Owner,
            updateRelayUrls: mock.fn(),
        };
        const candidate = {
            evolu: {
                [Symbol.asyncDispose]: mock.fn(() => Promise.resolve()),
            } as unknown as Evolu<TodoTestSchema>,
            owner: { id: 'candidate-owner' } as Owner,
            updateRelayUrls: mock.fn(),
        };
        const pendingCandidate = createPendingPromise<typeof candidate>();
        const createEvoluMock = mock.fn(() => pendingCandidate.promise);
        createEvoluMock.mock.mockImplementationOnce(async () => first);
        const createEvolu = createEvoluMock as unknown as CreateEvolu<TodoTestSchema>;
        const storage = await createEvoluStorageFactory<TodoTestSchema>({ createEvolu })({
            mnemonic: Mnemonic.orThrow(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            ),
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
            urls: [],
        });

        const firstRestore = storage.restoreOwner({
            mnemonic: restoredMnemonic,
            persistMnemonic: () => Promise.resolve(),
        });

        assert.strictEqual(storage.status, 'restoring');
        await assert.rejects(
            storage.restoreOwner({
                mnemonic: restoredMnemonic,
                persistMnemonic: () => Promise.resolve(),
            }),
            (error: unknown) => error instanceof Error && error.message.includes('restoring'),
        );

        pendingCandidate.resolve(candidate);
        await firstRestore;
        assert.strictEqual(storage.status, 'ready');

        await storage.dispose();
    });

    test('waits for restoration before disposing and rejects use after disposal', async () => {
        const events: Array<string> = [];
        const first = {
            evolu: {
                [Symbol.asyncDispose]: mock.fn(() => {
                    events.push('dispose:first');

                    return Promise.resolve();
                }),
            } as unknown as Evolu<TodoTestSchema>,
            owner: { id: 'first-owner' } as Owner,
            updateRelayUrls: mock.fn(),
        };
        const candidate = {
            evolu: {
                [Symbol.asyncDispose]: mock.fn(() => {
                    events.push('dispose:candidate');

                    return Promise.resolve();
                }),
            } as unknown as Evolu<TodoTestSchema>,
            owner: { id: 'candidate-owner' } as Owner,
            updateRelayUrls: mock.fn(),
        };
        const pendingCandidate = createPendingPromise<typeof candidate>();
        const createEvoluMock = mock.fn(() => pendingCandidate.promise);
        createEvoluMock.mock.mockImplementationOnce(async () => first);
        const createEvolu = createEvoluMock as unknown as CreateEvolu<TodoTestSchema>;
        const storage = await createEvoluStorageFactory<TodoTestSchema>({ createEvolu })({
            mnemonic: Mnemonic.orThrow(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
            ),
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
            urls: [],
        });
        const restore = storage.restoreOwner({
            mnemonic: restoredMnemonic,
            persistMnemonic: () => {
                events.push('persist:candidate');

                return Promise.resolve();
            },
        });
        const firstDispose = storage.dispose();
        const secondDispose = storage.dispose();

        assert.strictEqual(firstDispose, secondDispose);
        assert.strictEqual(storage.status, 'disposing');
        assert.deepStrictEqual(events, []);

        pendingCandidate.resolve(candidate);
        await restore;
        await firstDispose;

        assert.deepStrictEqual(events, ['persist:candidate', 'dispose:first', 'dispose:candidate']);
        assert.strictEqual(storage.status, 'disposed');
        assert.throws(
            () => storage.evolu,
            (error: unknown) => error instanceof Error && error.message.includes('disposed'),
        );
        assert.throws(
            () => storage.activeOwner,
            (error: unknown) => error instanceof Error && error.message.includes('disposed'),
        );
        await assert.rejects(
            storage.updateRelayUrls([]),
            (error: unknown) => error instanceof Error && error.message.includes('disposed'),
        );
        await assert.rejects(
            storage.restoreOwner({
                mnemonic: restoredMnemonic,
                persistMnemonic: () => Promise.resolve(),
            }),
            (error: unknown) => error instanceof Error && error.message.includes('disposed'),
        );
        assert.throws(
            () => storage.subscribeOwnerChange(mock.fn()),
            (error: unknown) => error instanceof Error && error.message.includes('disposed'),
        );
        assert.strictEqual(await storage.dispose(), undefined);
    });
});
