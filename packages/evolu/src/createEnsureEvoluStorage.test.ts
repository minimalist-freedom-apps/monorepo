import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { Mnemonic } from '@evolu/common';
import { createEnsureEvoluStorage } from './createEnsureEvoluStorage';
import type { CreateEvoluStorageDep } from './createEvoluStorageFactory';
import { mockEvoluStorage, TodoTestSchema } from './mockEvoluStorage';

const mnemonic = Mnemonic.orThrow(
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
);

describe(createEnsureEvoluStorage.name, () => {
    test('shares one in-flight creation between concurrent callers', async () => {
        let resolveOwner: ((value: typeof mnemonic) => void) | undefined;
        const ownerPromise = new Promise<typeof mnemonic>(resolve => {
            resolveOwner = resolve;
        });
        const storage = mockEvoluStorage([]);
        const createEvoluStorage = mock.fn<
            CreateEvoluStorageDep<typeof TodoTestSchema>['createEvoluStorage']
        >(() => Promise.resolve(storage));
        const ensureEvoluOwner = mock.fn(() => ownerPromise);
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner,
                getEvoluRelayUrls: () => [],
                onOwnerUsed: mock.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        const first = ensureEvoluStorage();
        const second = ensureEvoluStorage();

        assert.strictEqual(first, second);
        assert.strictEqual(ensureEvoluOwner.mock.callCount(), 1);
        resolveOwner?.(mnemonic);
        assert.deepStrictEqual(await Promise.all([first, second]), [storage, storage]);
        assert.strictEqual(createEvoluStorage.mock.callCount(), 1);
    });

    test('retries creation after a failed attempt', async () => {
        const storage = mockEvoluStorage([]);
        const creationError = new Error('worker creation failed');
        const createEvoluStorage = mock.fn(async () => storage);
        createEvoluStorage.mock.mockImplementationOnce(() => Promise.reject(creationError));
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => [],
                onOwnerUsed: mock.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        await assert.rejects(ensureEvoluStorage(), (error: unknown) => {
            assert.strictEqual(error, creationError);

            return true;
        });
        assert.strictEqual(await ensureEvoluStorage(), storage);
        assert.strictEqual(createEvoluStorage.mock.callCount(), 2);
    });

    test('creates a fresh instance after the cached storage is disposed', async () => {
        const firstStorage = mockEvoluStorage([]);
        const secondStorage = mockEvoluStorage([]);
        const createEvoluStorage = mock.fn(async () => secondStorage);
        createEvoluStorage.mock.mockImplementationOnce(async () => firstStorage);
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => [],
                onOwnerUsed: mock.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        assert.strictEqual(await ensureEvoluStorage(), firstStorage);
        await firstStorage.dispose();
        assert.strictEqual(await ensureEvoluStorage(), secondStorage);
        assert.strictEqual(createEvoluStorage.mock.callCount(), 2);
    });

    test('reads the latest configured relays when storage is first created', async () => {
        const storage = mockEvoluStorage([]);
        const createEvoluStorage = mock.fn<
            CreateEvoluStorageDep<typeof TodoTestSchema>['createEvoluStorage']
        >(() => Promise.resolve(storage));
        let relayUrls: ReadonlyArray<string> = ['wss://one.example'];
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => relayUrls,
                onOwnerUsed: mock.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        relayUrls = ['wss://two.example', 'wss://three.example'];
        await ensureEvoluStorage();

        const createStorageParams = createEvoluStorage.mock.calls.at(-1)?.arguments[0];
        assert.deepStrictEqual(createStorageParams?.urls, relayUrls);
    });
});
