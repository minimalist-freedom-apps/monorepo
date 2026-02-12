import { describe, expect, test, vi } from 'vitest';
import { createSubscribableQuery } from './createSubscribableQuery.js';

const createMockDeps = () => {
    const unsubscribe = vi.fn();
    const subscribeQueryListener = vi.fn(() => unsubscribe);
    const rows = [{ id: '1' }, { id: '2' }];

    const evolu = {
        subscribeQuery: vi.fn(() => subscribeQueryListener),
        loadQuery: vi.fn(() => Promise.resolve(rows)),
        getQueryRows: vi.fn(() => rows),
    };

    return {
        deps: { ensureEvolu: () => ({ evolu }) },
        query: 'test-query',
        evolu,
        unsubscribe,
        subscribeQueryListener,
        rows,
    };
};

// biome-ignore lint/suspicious/noExplicitAny: test mocks
type Any = any;

describe(createSubscribableQuery.name, () => {
    test('getState delegates to evolu.getQueryRows', () => {
        const { deps, query, evolu, rows } = createMockDeps();
        const subscribable = createSubscribableQuery(deps as Any, query as Any);

        const result = subscribable.getState();

        expect(evolu.getQueryRows).toHaveBeenCalledWith(query);
        expect(result).toBe(rows);
    });

    test('subscribe registers listener via subscribeQuery', () => {
        const { deps, query, subscribeQueryListener } = createMockDeps();
        const subscribable = createSubscribableQuery(deps as Any, query as Any);
        const listener = vi.fn();

        subscribable.subscribe(listener);

        expect(subscribeQueryListener).toHaveBeenCalledWith(listener);
    });

    test('subscribe returns unsubscribe from subscribeQuery', () => {
        const { deps, query, unsubscribe } = createMockDeps();
        const subscribable = createSubscribableQuery(deps as Any, query as Any);
        const listener = vi.fn();

        const result = subscribable.subscribe(listener);

        expect(result).toBe(unsubscribe);
    });

    test('subscribe calls loadQuery to trigger initial data load', () => {
        const { deps, query, evolu } = createMockDeps();
        const subscribable = createSubscribableQuery(deps as Any, query as Any);
        const listener = vi.fn();

        subscribable.subscribe(listener);

        expect(evolu.loadQuery).toHaveBeenCalledWith(query);
    });

    test('subscribe calls listener when loadQuery resolves', async () => {
        const { deps, query } = createMockDeps();
        const subscribable = createSubscribableQuery(deps as Any, query as Any);
        const listener = vi.fn();

        subscribable.subscribe(listener);

        expect(listener).not.toHaveBeenCalled();

        await vi.waitFor(() => {
            expect(listener).toHaveBeenCalledOnce();
        });
    });

    test('subscribe registers listener before calling loadQuery', () => {
        const callOrder: ReadonlyArray<string> = [];
        const unsubscribe = vi.fn();

        const evolu = {
            subscribeQuery: vi.fn(() => {
                const register = vi.fn(() => {
                    (callOrder as string[]).push('subscribeQuery');

                    return unsubscribe;
                });

                return register;
            }),
            loadQuery: vi.fn(() => {
                (callOrder as string[]).push('loadQuery');

                return Promise.resolve([]);
            }),
            getQueryRows: vi.fn(() => []),
        };
        const deps = { ensureEvolu: () => ({ evolu }) };
        const subscribable = createSubscribableQuery(deps as Any, 'q' as Any);

        subscribable.subscribe(vi.fn());

        expect(callOrder).toEqual(['subscribeQuery', 'loadQuery']);
    });

    test('defers ensureEvolu call to subscribe time', () => {
        const evolu = {
            subscribeQuery: vi.fn(() => vi.fn(() => vi.fn())),
            loadQuery: vi.fn(() => Promise.resolve([])),
            getQueryRows: vi.fn(() => []),
        };
        const ensureEvolu = vi.fn(() => ({ evolu }));
        const deps = { ensureEvolu };

        createSubscribableQuery(deps as Any, 'q' as Any);

        expect(ensureEvolu).not.toHaveBeenCalled();
    });
});
