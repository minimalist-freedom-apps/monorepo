import { Mnemonic } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import { createEnsureEvoluStorage } from './createEnsureEvoluStorage';
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
        const createEvoluStorage = vi.fn(() => Promise.resolve(storage));
        const ensureEvoluOwner = vi.fn(() => ownerPromise);
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner,
                getEvoluRelayUrls: () => [],
                onOwnerUsed: vi.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        const first = ensureEvoluStorage();
        const second = ensureEvoluStorage();

        expect(first).toBe(second);
        expect(ensureEvoluOwner).toHaveBeenCalledOnce();
        resolveOwner?.(mnemonic);
        await expect(Promise.all([first, second])).resolves.toEqual([storage, storage]);
        expect(createEvoluStorage).toHaveBeenCalledOnce();
    });

    test('retries creation after a failed attempt', async () => {
        const storage = mockEvoluStorage([]);
        const creationError = new Error('worker creation failed');
        const createEvoluStorage = vi
            .fn()
            .mockRejectedValueOnce(creationError)
            .mockResolvedValueOnce(storage);
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => [],
                onOwnerUsed: vi.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        await expect(ensureEvoluStorage()).rejects.toBe(creationError);
        await expect(ensureEvoluStorage()).resolves.toBe(storage);
        expect(createEvoluStorage).toHaveBeenCalledTimes(2);
    });

    test('creates a fresh instance after the cached storage is disposed', async () => {
        const firstStorage = mockEvoluStorage([]);
        const secondStorage = mockEvoluStorage([]);
        const createEvoluStorage = vi
            .fn()
            .mockResolvedValueOnce(firstStorage)
            .mockResolvedValueOnce(secondStorage);
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => [],
                onOwnerUsed: vi.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        await expect(ensureEvoluStorage()).resolves.toBe(firstStorage);
        await firstStorage.dispose();
        await expect(ensureEvoluStorage()).resolves.toBe(secondStorage);
        expect(createEvoluStorage).toHaveBeenCalledTimes(2);
    });

    test('reads the latest configured relays when storage is first created', async () => {
        const storage = mockEvoluStorage([]);
        const createEvoluStorage = vi.fn(() => Promise.resolve(storage));
        let relayUrls: ReadonlyArray<string> = ['wss://one.example'];
        const ensureEvoluStorage = createEnsureEvoluStorage({
            deps: {
                createEvoluStorage,
                ensureEvoluOwner: () => Promise.resolve(mnemonic),
                getEvoluRelayUrls: () => relayUrls,
                onOwnerUsed: vi.fn(),
            },
            schema: TodoTestSchema,
            appName: 'minimalist-apps-test',
        });

        relayUrls = ['wss://two.example', 'wss://three.example'];
        await ensureEvoluStorage();

        expect(createEvoluStorage).toHaveBeenCalledWith(
            expect.objectContaining({ urls: relayUrls }),
        );
    });
});
