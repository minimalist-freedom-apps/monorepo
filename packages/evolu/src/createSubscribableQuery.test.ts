import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import type { Query, Row } from '@evolu/common';
import { createSubscribableQuery } from './createSubscribableQuery';
import type { EvoluStorage } from './EvoluStorage';
import { mockEvoluStorage, type TodoTestSchema } from './mockEvoluStorage';

// Query is not important here since we're mocking the storage and directly emitting updates
const query = '' as Query<TodoTestSchema, Row>;

describe(createSubscribableQuery.name, () => {
    test('loads and exposes mapped rows after ensureEvoluStorage resolves', async () => {
        const storage = mockEvoluStorage([{ id: 'todo-1', value: 'buy milk' }]);

        let resolveStorage: ((value: EvoluStorage<TodoTestSchema>) => void) | null = null;

        const ensureStoragePromise = new Promise<EvoluStorage<TodoTestSchema>>(resolve => {
            resolveStorage = resolve;
        });

        const subscribable = createSubscribableQuery(
            { ensureEvoluStorage: () => ensureStoragePromise },
            () => query,
            rows => rows,
        );

        const listener = mock.fn();
        subscribable.subscribe(listener);

        // 1. getState should return the empty array as `ensureEvoluStorage` has no resolved yet
        assert.deepStrictEqual(subscribable.getState(), []);
        assert.strictEqual(listener.mock.callCount(), 0);

        // 2. Resolve the `ensureEvoluStorage` promise
        assert.notStrictEqual(resolveStorage, null);
        resolveStorage!(storage);

        // Microtask flush to allow promise resolution and subsequent query loading
        await Promise.resolve();
        await Promise.resolve();

        // State shall be the initial rows (buy-milk)
        assert.ok(listener.mock.callCount() > 0);
        assert.deepStrictEqual(subscribable.getState(), [{ id: 'todo-1', value: 'buy milk' }]);

        // 3. Emit an update from the Evolu
        storage.emitUpdate([{ id: 'todo-2', value: 'walk dog' }]);

        assert.ok(listener.mock.callCount() > 0);
        assert.deepStrictEqual(subscribable.getState(), [{ id: 'todo-2', value: 'walk dog' }]);
    });

    test('rebinds to the restored owner and ignores stale owner updates', async () => {
        const firstStorage = mockEvoluStorage([{ id: 'old', value: 'old owner' }]);
        const secondStorage = mockEvoluStorage([{ id: 'new', value: 'new owner' }]);
        const ownerChangeListeners = new Set<() => void>();
        let activeStorage = firstStorage;
        const storage: EvoluStorage<TodoTestSchema> = {
            status: 'ready',
            get evolu() {
                return activeStorage.evolu;
            },
            get activeOwner() {
                return activeStorage.activeOwner;
            },
            subscribeOwnerChange: (listener: () => void) => {
                ownerChangeListeners.add(listener);

                return () => {
                    ownerChangeListeners.delete(listener);
                };
            },
            updateRelayUrls: async () => {},
            restoreOwner: async () => {},
            dispose: async () => {},
        };
        const subscribable = createSubscribableQuery(
            { ensureEvoluStorage: () => Promise.resolve(storage) },
            () => query,
            rows => rows,
        );
        const listener = mock.fn();
        subscribable.subscribe(listener);
        await Promise.resolve();
        await Promise.resolve();

        assert.deepStrictEqual(subscribable.getState(), [{ id: 'old', value: 'old owner' }]);

        activeStorage = secondStorage;

        for (const ownerChangeListener of ownerChangeListeners) {
            ownerChangeListener();
        }
        await Promise.resolve();

        assert.deepStrictEqual(subscribable.getState(), [{ id: 'new', value: 'new owner' }]);

        secondStorage.emitUpdate([{ id: 'newer', value: 'new owner update' }]);
        assert.deepStrictEqual(subscribable.getState(), [
            { id: 'newer', value: 'new owner update' },
        ]);

        firstStorage.emitUpdate([{ id: 'stale', value: 'stale owner update' }]);
        assert.deepStrictEqual(subscribable.getState(), [
            { id: 'newer', value: 'new owner update' },
        ]);
    });
});
