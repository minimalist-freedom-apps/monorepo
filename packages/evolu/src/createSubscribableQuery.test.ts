import type { Query, Row } from '@evolu/common';
import { describe, expect, test, vi } from 'vitest';
import type { EvoluStorage } from './createEnsureEvoluStorage';
import { createSubscribableQuery } from './createSubscribableQuery';
import { mockEvoluStorage, type TodoTestSchema } from './mockEvoluStorage';

// Query is not important here since we're mocking the storage and directly emitting updates
const query = '' as Query<Row>;

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

        const listener = vi.fn();
        subscribable.subscribe(listener);

        // 1. getState should return the empty array as `ensureEvoluStorage` has no resolved yet
        expect(subscribable.getState()).toEqual([]);
        expect(listener).not.toHaveBeenCalled();

        // 2. Resolve the `ensureEvoluStorage` promise
        expect(resolveStorage).not.toBeNull();
        resolveStorage!(storage);

        // Microtask flush to allow promise resolution and subsequent query loading
        await Promise.resolve();
        await Promise.resolve();

        // State shall be the initial rows (buy-milk)
        expect(listener).toHaveBeenCalled();
        expect(subscribable.getState()).toEqual([{ id: 'todo-1', value: 'buy milk' }]);

        // 3. Emit an update from the Evolu
        storage.emitUpdate([{ id: 'todo-2', value: 'walk dog' }]);

        expect(listener).toHaveBeenCalled();
        expect(subscribable.getState()).toEqual([{ id: 'todo-2', value: 'walk dog' }]);
    });
});
