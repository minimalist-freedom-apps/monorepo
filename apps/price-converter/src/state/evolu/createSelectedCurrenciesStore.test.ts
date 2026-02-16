import { describe, expect, test, vi } from 'vitest';
import { createSelectedCurrenciesStore } from './createSelectedCurrenciesStore';

// biome-ignore lint/suspicious/noExplicitAny: test mocks
const asAny = <T>(value: T): any => value;

describe(createSelectedCurrenciesStore.name, () => {
    test('defers ensureEvoluStorage call to subscribe/getState time', () => {
        const ensureEvoluStorage = vi.fn();

        createSelectedCurrenciesStore({ ensureEvoluStorage: asAny(ensureEvoluStorage) });

        expect(ensureEvoluStorage).not.toHaveBeenCalled();
    });

    test('calls ensureEvoluStorage when subscribing', () => {
        const query = Symbol('query');
        const unsubscribe = vi.fn();
        const listenerRegistrar = vi.fn(() => unsubscribe);
        const evolu = {
            createQuery: vi.fn(() => query),
            subscribeQuery: vi.fn(() => listenerRegistrar),
            loadQuery: vi.fn(() => Promise.resolve([])),
            getQueryRows: vi.fn(() => []),
        };
        const storage = {
            evolu,
            shardOwner: { id: 'owner-id' },
        };
        const ensureEvoluStorage = vi.fn(() => Promise.resolve(asAny(storage)));
        const selectedCurrenciesStore = createSelectedCurrenciesStore({
            ensureEvoluStorage: asAny(ensureEvoluStorage),
        });

        selectedCurrenciesStore.subscribe(vi.fn());

        expect(ensureEvoluStorage).toHaveBeenCalledOnce();
    });
});
